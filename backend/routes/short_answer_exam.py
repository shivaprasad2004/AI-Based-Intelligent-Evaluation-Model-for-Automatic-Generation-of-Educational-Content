from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import db
from utils.auth_helpers import student_required
from models.short_answer_exam import ShortAnswerExam
from models.user import User
from services.short_answer_evaluator import generate_short_answer_questions, evaluate_short_answer
import json

short_answer_exam_bp = Blueprint('short_answer_exam', __name__)


@short_answer_exam_bp.route('/start', methods=['POST'])
@jwt_required()
@student_required
def start_short_answer_exam():
    """Generate short answer questions for a topic."""
    data = request.get_json()
    topic = data.get('topic', '').strip()
    count = min(data.get('count', 5), 10)
    difficulty = min(max(data.get('difficulty', 3), 1), 5)

    if not topic or len(topic) < 2:
        return jsonify({'error': 'Topic must be at least 2 characters'}), 400

    try:
        questions = generate_short_answer_questions(topic, count, difficulty)
    except Exception as e:
        current_app.logger.error(f"Short answer question generation failed for '{topic}': {e}")
        questions = []

    if not questions:
        return jsonify({
            'error': 'Failed to generate questions. Please try again or choose a different topic.'
        }), 503

    # Return questions without correct answers or keywords
    safe_questions = []
    for i, q in enumerate(questions):
        safe_questions.append({
            'index': i,
            'question_text': q['question_text'],
            'difficulty': q.get('difficulty', difficulty)
        })

    return jsonify({
        'topic': topic,
        'questions': safe_questions,
        'total_questions': len(questions),
        'time_limit_seconds': len(questions) * 120,  # 2 minutes per question
        'word_limit': '10-15 words per answer',
        'instructions': f'Answer each question about "{topic}" in 10-15 words. Be concise but cover the key concepts. You have {len(questions) * 2} minutes.',
        '_questions_data': questions  # Full data for evaluation (stored server-side via session)
    })


@short_answer_exam_bp.route('/submit', methods=['POST'])
@jwt_required()
@student_required
def submit_short_answer_exam():
    """Submit and evaluate short answer exam."""
    data = request.get_json()
    topic = data.get('topic', '').strip()
    answers = data.get('answers', [])
    questions_data = data.get('questions_data', [])
    time_taken = data.get('time_taken_seconds', 0)

    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
    if not answers:
        return jsonify({'error': 'Answers are required'}), 400
    if not questions_data:
        return jsonify({'error': 'Questions data is required'}), 400

    student_id = int(get_jwt_identity())

    # Evaluate each answer
    results = []
    total_score = 0.0

    for i, q in enumerate(questions_data):
        student_answer = ''
        for ans in answers:
            if ans.get('index') == i:
                student_answer = ans.get('answer', '')
                break

        correct_answer = q.get('correct_answer', '')
        keywords = q.get('keywords', [])

        try:
            eval_result = evaluate_short_answer(student_answer, correct_answer, keywords)
        except Exception as e:
            current_app.logger.error(f"Short answer evaluation failed for Q{i}: {e}")
            eval_result = {
                'score': 0.0,
                'is_correct': False,
                'matched_keywords': [],
                'missed_keywords': keywords,
                'feedback': 'Evaluation error. Please try again.'
            }

        question_score = eval_result['score']
        total_score += question_score

        results.append({
            'question_index': i,
            'question_text': q.get('question_text', ''),
            'student_answer': student_answer,
            'correct_answer': correct_answer,
            'keywords': keywords,
            'score': round(question_score, 2),
            'is_correct': eval_result['is_correct'],
            'matched_keywords': eval_result['matched_keywords'],
            'missed_keywords': eval_result['missed_keywords'],
            'feedback': eval_result['feedback'],
            'explanation': q.get('explanation', '')
        })

    # Calculate percentage
    total_questions = len(questions_data)
    percentage = (total_score / max(total_questions, 1)) * 100
    percentage = round(min(percentage, 100), 1)

    # Assign grade
    grade = _assign_grade(percentage)

    # Build overall feedback
    correct_count = sum(1 for r in results if r['is_correct'])
    partial_count = sum(1 for r in results if not r['is_correct'] and r['score'] >= 0.3)

    strengths = []
    weaknesses = []

    if correct_count == total_questions:
        strengths.append('Perfect score! All answers demonstrate strong understanding.')
    elif correct_count >= total_questions * 0.7:
        strengths.append(f'Good performance: {correct_count}/{total_questions} questions answered correctly.')
    if partial_count > 0:
        weaknesses.append(f'{partial_count} answer(s) were partially correct - review the missed keywords.')

    # Identify most missed keywords
    all_missed = []
    for r in results:
        all_missed.extend(r.get('missed_keywords', []))
    if all_missed:
        top_missed = list(set(all_missed))[:5]
        weaknesses.append(f'Key concepts to review: {", ".join(top_missed)}')

    if percentage >= 80:
        overall = f'Excellent performance on {topic}! You scored {percentage}% with {correct_count}/{total_questions} correct answers.'
    elif percentage >= 60:
        overall = f'Good attempt on {topic}. You scored {percentage}% with {correct_count}/{total_questions} correct. Review the missed keywords to improve.'
    elif percentage >= 40:
        overall = f'Fair performance on {topic}. Score: {percentage}%. Focus on understanding the key concepts and their definitions.'
    else:
        overall = f'Your performance on {topic} needs improvement. Score: {percentage}%. Study the topic material and review all correct answers.'

    feedback_data = {
        'overall': overall,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'correct_count': correct_count,
        'partial_count': partial_count,
        'score_breakdown': {
            'correct': correct_count,
            'partial': partial_count,
            'incorrect': total_questions - correct_count - partial_count
        }
    }

    # Save to database
    exam = ShortAnswerExam(
        student_id=student_id,
        topic_name=topic,
        topic_key=topic.lower(),
        questions_data=json.dumps(questions_data),
        answers_data=json.dumps(results),
        total_questions=total_questions,
        total_score=percentage,
        grade=grade,
        time_taken_seconds=time_taken,
        feedback=json.dumps(feedback_data)
    )
    db.session.add(exam)

    # Award XP
    user = User.query.get(student_id)
    xp_earned = 0
    if user:
        user.update_streak()
        xp_earned = int(percentage / 100 * 40)  # Max 40 XP for short answer exam
        user.add_xp(xp_earned)

    db.session.commit()

    return jsonify({
        'exam_id': exam.id,
        'topic': topic,
        'total_score': percentage,
        'grade': grade,
        'total_questions': total_questions,
        'correct_count': correct_count,
        'results': results,
        'feedback': feedback_data,
        'time_taken_seconds': time_taken,
        'xp_earned': xp_earned,
        'current_streak': user.current_streak if user else 0,
        'total_xp': user.total_xp if user else 0
    })


@short_answer_exam_bp.route('/history', methods=['GET'])
@jwt_required()
@student_required
def short_answer_history():
    """Get short answer exam history for the current student."""
    student_id = int(get_jwt_identity())
    exams = ShortAnswerExam.query.filter_by(student_id=student_id).order_by(
        ShortAnswerExam.created_at.desc()
    ).all()

    return jsonify({
        'exams': [e.to_summary() for e in exams]
    })


@short_answer_exam_bp.route('/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_short_answer_exam(exam_id):
    """Get full details of a specific short answer exam."""
    student_id = int(get_jwt_identity())
    exam = ShortAnswerExam.query.get_or_404(exam_id)

    if exam.student_id != student_id:
        return jsonify({'error': 'Not authorized'}), 403

    return jsonify(exam.to_dict())


def _assign_grade(score):
    if score >= 90:
        return 'A+'
    elif score >= 80:
        return 'A'
    elif score >= 70:
        return 'B+'
    elif score >= 60:
        return 'B'
    elif score >= 50:
        return 'C'
    elif score >= 40:
        return 'D'
    else:
        return 'F'
