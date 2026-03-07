from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from utils.db import db
from services.ai_service import get_ai_response, parse_json_response
from utils.prompts import (
    TOPIC_CONTENT_PROMPT, DYNAMIC_QUIZ_PROMPT, ANSWER_EVALUATION_PROMPT
)
from models.search_cache import TopicSearchCache
from models.topic import Topic
from models.question import Question
from models.response import QuizSession, StudentResponse
from models.performance import PerformanceRecord
from services.adaptive import get_student_level, update_performance
from utils.auth_helpers import student_required
import json

dynamic_bp = Blueprint('dynamic', __name__)


@dynamic_bp.route('/search-topic', methods=['POST'])
@jwt_required()
def search_topic():
    """Dynamically generate educational content for a topic using real web data."""
    data = request.get_json()
    topic = data.get('topic', '').strip()

    if not topic or len(topic) < 2:
        return jsonify({'error': 'Topic must be at least 2 characters'}), 400

    topic_key = topic.lower().strip()

    # Check cache first
    cached = TopicSearchCache.query.filter_by(topic_key=topic_key).first()
    if cached:
        return jsonify(cached.to_dict())

    # Generate content via AI service (fetches real web data in mock mode)
    try:
        prompt = TOPIC_CONTENT_PROMPT.format(topic=topic)
        raw = get_ai_response(prompt)
        content = parse_json_response(raw)
        # Ensure all required fields exist
        content.setdefault('overview', '')
        content.setdefault('key_concepts', [])
        content.setdefault('examples', [])
        content.setdefault('study_material', '')
        content.setdefault('wikipedia_url', '')
        content.setdefault('wikipedia_title', topic)
        content.setdefault('web_resources', [])
        content.setdefault('related_topics', [])
        content.setdefault('infobox', {})
    except Exception as e:
        print(f"Content generation error (primary): {e}")
        # Retry with explicit mock/web-data approach
        try:
            from services.ai_service import _generate_real_topic_content
            raw = _generate_real_topic_content(prompt)
            content = json.loads(raw)
        except Exception as e2:
            print(f"Content generation error (fallback): {e2}")
            content = {
                'overview': f'{topic} is an important area of study. Please try again later.',
                'key_concepts': [],
                'examples': [],
                'study_material': f'Study the fundamentals of {topic}.',
                'wikipedia_url': '',
                'wikipedia_title': topic,
                'web_resources': [],
                'related_topics': [],
                'infobox': {}
            }

    # Cache the result
    cache_entry = TopicSearchCache(
        topic_key=topic_key,
        topic_name=topic,
        overview=content.get('overview', ''),
        key_concepts=json.dumps(content.get('key_concepts', [])),
        examples=json.dumps(content.get('examples', [])),
        study_material=content.get('study_material', ''),
        wikipedia_url=content.get('wikipedia_url', ''),
        wikipedia_title=content.get('wikipedia_title', topic),
        web_resources=json.dumps(content.get('web_resources', [])),
        related_topics=json.dumps(content.get('related_topics', [])),
        infobox=json.dumps(content.get('infobox', {}))
    )
    db.session.add(cache_entry)
    db.session.commit()

    return jsonify(cache_entry.to_dict())


@dynamic_bp.route('/search-topic/clear-cache', methods=['POST'])
@jwt_required()
def clear_topic_cache():
    """Clear cache for a topic to force re-fetch."""
    data = request.get_json()
    topic = data.get('topic', '').strip().lower()
    if topic:
        cached = TopicSearchCache.query.filter_by(topic_key=topic).first()
        if cached:
            db.session.delete(cached)
            db.session.commit()
            return jsonify({'message': 'Cache cleared'})
    return jsonify({'message': 'No cache found'}), 404


@dynamic_bp.route('/generate-quiz', methods=['POST'])
@jwt_required()
@student_required
def generate_quiz():
    """Generate a dynamic quiz from a searched topic."""
    data = request.get_json()
    topic_name = data.get('topic', '').strip()
    difficulty = data.get('difficulty', None)
    count = min(data.get('count', 5), 15)

    if not topic_name:
        return jsonify({'error': 'topic is required'}), 400

    student_id = int(get_jwt_identity())

    # Find or create topic
    topic = Topic.query.filter(
        db.func.lower(Topic.name) == topic_name.lower()
    ).first()

    if not topic:
        topic = Topic(
            name=topic_name,
            description=f'Dynamically generated topic: {topic_name}',
            is_system=True,
            tags=topic_name.lower()
        )
        db.session.add(topic)
        db.session.commit()

    # Adaptive difficulty
    if difficulty is None:
        difficulty = get_student_level(student_id, topic.id)

    # Generate questions via AI (uses real web data)
    try:
        prompt = DYNAMIC_QUIZ_PROMPT.format(
            count=count, topic=topic_name, difficulty=difficulty
        )
        raw = get_ai_response(prompt)
        questions_data = parse_json_response(raw)
    except Exception as e:
        print(f"Quiz generation error: {e}")
        questions_data = []

    if not questions_data:
        return jsonify({'error': 'Failed to generate quiz questions. Try a different topic.'}), 500

    # Save questions
    saved_questions = []
    for qd in questions_data:
        q = Question(
            topic_id=topic.id,
            question_type=qd.get('question_type', 'mcq'),
            difficulty=qd.get('difficulty', difficulty),
            question_text=qd.get('question_text', ''),
            correct_answer=qd.get('correct_answer', ''),
            explanation=qd.get('explanation', '')
        )
        if qd.get('options'):
            q.options = qd['options']
        db.session.add(q)
        saved_questions.append(q)

    # Create session
    session = QuizSession(
        student_id=student_id,
        topic_id=topic.id,
        difficulty_level=difficulty
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({
        'session_id': session.id,
        'topic_id': topic.id,
        'topic_name': topic.name,
        'difficulty_level': difficulty,
        'questions': [q.to_dict() for q in saved_questions]
    })


@dynamic_bp.route('/submit-quiz', methods=['POST'])
@jwt_required()
@student_required
def submit_quiz():
    """Evaluate quiz answers with intelligent scoring."""
    data = request.get_json()
    session_id = data.get('session_id')
    answers = data.get('answers', [])

    if not session_id or not answers:
        return jsonify({'error': 'session_id and answers are required'}), 400

    student_id = int(get_jwt_identity())
    session = QuizSession.query.get_or_404(session_id)

    if session.student_id != student_id:
        return jsonify({'error': 'Not authorized'}), 403
    if session.completed_at:
        return jsonify({'error': 'Quiz already submitted'}), 400

    topic = Topic.query.get(session.topic_id)
    topic_name = topic.name if topic else 'Unknown'

    # Build Q&A pairs for evaluation
    qa_pairs_text = ""
    question_map = {}
    for ans in answers:
        qid = ans.get('question_id')
        question = Question.query.get(qid)
        if not question:
            continue
        question_map[qid] = question
        qa_pairs_text += (
            f"Question ID: {qid}\n"
            f"Type: {question.question_type}\n"
            f"Question: {question.question_text}\n"
            f"Correct Answer: {question.correct_answer}\n"
            f"Student Answer: {ans.get('answer', '(no answer)')}\n\n"
        )

    # AI evaluation
    eval_results = {}
    try:
        prompt = ANSWER_EVALUATION_PROMPT.format(
            topic=topic_name, qa_pairs=qa_pairs_text
        )
        raw = get_ai_response(prompt)
        evaluations = parse_json_response(raw)
        for ev in evaluations:
            eval_results[ev['question_id']] = ev
    except Exception as e:
        print(f"Evaluation error: {e}")

    # Process answers
    total_score = 0
    max_score = len(answers)
    results = []

    for ans in answers:
        qid = ans.get('question_id')
        student_answer = ans.get('answer', '')
        question = question_map.get(qid)
        if not question:
            continue

        if qid in eval_results:
            ev = eval_results[qid]
            score = ev.get('score', 0)
            is_correct = ev.get('is_correct', False)
            feedback = ev.get('feedback', '')
        else:
            from services.evaluator import evaluate_response
            ev = evaluate_response(question, student_answer)
            score = ev['score']
            is_correct = ev['is_correct']
            feedback = ev['feedback']

        response = StudentResponse(
            session_id=session_id,
            question_id=qid,
            student_answer=student_answer,
            is_correct=is_correct,
            score=score,
            ai_feedback=feedback
        )
        db.session.add(response)
        total_score += score

        results.append({
            'question_id': qid,
            'question_text': question.question_text,
            'question_type': question.question_type,
            'student_answer': student_answer,
            'correct_answer': question.correct_answer,
            'is_correct': is_correct,
            'score': score,
            'feedback': feedback,
            'explanation': question.explanation
        })

    session.total_score = total_score
    session.max_score = max_score
    session.completed_at = datetime.utcnow()

    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    perf_record = update_performance(student_id, session.topic_id, percentage)

    from models.user import User
    user = User.query.get(student_id)
    xp_earned = 0
    if user:
        user.update_streak()
        xp_earned = int(total_score * session.difficulty_level * 10)
        user.add_xp(xp_earned)

    db.session.commit()

    # Adaptive recommendations
    recommendations = []
    if percentage < 50:
        recommendations.append({
            'type': 'easier_questions',
            'message': f'Consider reviewing the basics of {topic_name}. Try a quiz at difficulty level {max(1, session.difficulty_level - 1)}.'
        })
        recommendations.append({
            'type': 'study_material',
            'message': f'We recommend studying the key concepts of {topic_name} before retaking the quiz.'
        })
    elif percentage >= 80:
        recommendations.append({
            'type': 'advanced',
            'message': f'Excellent work! Try a harder quiz at difficulty level {min(5, session.difficulty_level + 1)}.'
        })
    else:
        recommendations.append({
            'type': 'practice',
            'message': f'Good effort! Keep practicing {topic_name} at this level to strengthen your understanding.'
        })

    return jsonify({
        'session_id': session.id,
        'topic_name': topic_name,
        'total_score': round(total_score, 2),
        'max_score': max_score,
        'percentage': round(percentage, 1),
        'results': results,
        'xp_earned': xp_earned,
        'current_streak': user.current_streak if user else 0,
        'total_xp': user.total_xp if user else 0,
        'new_difficulty_level': perf_record.current_level if perf_record else session.difficulty_level,
        'recommendations': recommendations
    })


@dynamic_bp.route('/student-progress', methods=['GET'])
@jwt_required()
@student_required
def student_progress():
    """Get comprehensive learning analytics."""
    student_id = int(get_jwt_identity())

    records = PerformanceRecord.query.filter_by(student_id=student_id).all()
    sessions = QuizSession.query.filter_by(student_id=student_id).filter(
        QuizSession.completed_at.isnot(None)
    ).order_by(QuizSession.completed_at.desc()).all()

    # Overall accuracy
    total_correct = 0
    total_questions = 0
    for s in sessions:
        if s.total_score is not None and s.max_score:
            total_correct += s.total_score
            total_questions += s.max_score

    overall_accuracy = round(
        (total_correct / total_questions * 100) if total_questions > 0 else 0, 1
    )

    # Topic performance
    topic_performance = []
    for r in records:
        topic = Topic.query.get(r.topic_id)
        topic_performance.append({
            'topic_id': r.topic_id,
            'topic_name': topic.name if topic else 'Unknown',
            'average_score': round(r.average_score, 1),
            'current_level': r.current_level,
            'total_quizzes': r.total_quizzes
        })

    # Improvement trend (last 20 quizzes)
    improvement_trend = []
    for s in sessions[:20]:
        pct = round((s.total_score / s.max_score * 100) if s.max_score else 0, 1)
        improvement_trend.append({
            'date': s.completed_at.strftime('%Y-%m-%d'),
            'score': pct,
            'topic': s.topic.name if s.topic else 'Unknown',
            'difficulty': s.difficulty_level
        })

    # Recent quizzes
    recent_quizzes = []
    for s in sessions[:10]:
        pct = round((s.total_score / s.max_score * 100) if s.max_score else 0, 1)
        recent_quizzes.append({
            'session_id': s.id,
            'topic_name': s.topic.name if s.topic else 'Unknown',
            'percentage': pct,
            'difficulty': s.difficulty_level,
            'date': s.completed_at.strftime('%b %d, %Y'),
            'score': f"{s.total_score:.1f}/{s.max_score}" if s.total_score is not None else "N/A"
        })

    weak = [t for t in topic_performance if t['average_score'] < 50]
    strong = [t for t in topic_performance if t['average_score'] >= 80]

    return jsonify({
        'overall_accuracy': overall_accuracy,
        'total_quizzes': len(sessions),
        'total_topics_studied': len(records),
        'topic_performance': sorted(topic_performance, key=lambda x: -x['average_score']),
        'improvement_trend': list(reversed(improvement_trend)),
        'recent_quizzes': recent_quizzes,
        'weak_topics': sorted(weak, key=lambda x: x['average_score']),
        'strong_topics': sorted(strong, key=lambda x: -x['average_score']),
    })
