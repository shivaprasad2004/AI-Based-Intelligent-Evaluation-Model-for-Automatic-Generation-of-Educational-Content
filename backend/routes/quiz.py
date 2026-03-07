from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.question import Question
from models.response import QuizSession, StudentResponse
from models.topic import Topic
from services.evaluator import evaluate_response
from services.feedback_generator import generate_feedback
from services.adaptive import get_student_level, update_performance
from utils.db import db
from utils.auth_helpers import student_required

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/start', methods=['POST'])
@jwt_required()
@student_required
def start_quiz():
    data = request.get_json()
    topic_id = data.get('topic_id')
    if not topic_id:
        return jsonify({'error': 'topic_id is required'}), 400

    topic = Topic.query.get_or_404(topic_id)
    student_id = int(get_jwt_identity())

    # Get adaptive difficulty level
    level = get_student_level(student_id, topic_id)

    # Auto-generate questions if not enough exist
    existing_count = Question.query.filter_by(topic_id=topic_id).count()
    if existing_count < 10:
        try:
            from services.question_generator import generate_questions
            new_questions = generate_questions(
                topic.name,
                topic.description or topic.name,
                difficulty=level,
                count=10 - existing_count,
                types=['mcq']
            )
            for q in new_questions:
                q.topic_id = topic_id
                db.session.add(q)
            db.session.commit()
        except Exception as e:
            print(f"Auto-generation failed: {e}")

    # Select questions at or near the student's level
    questions = Question.query.filter(
        Question.topic_id == topic_id,
        Question.difficulty.between(max(1, level - 1), min(5, level + 1))
    ).order_by(db.func.random()).limit(10).all()

    if not questions:
        # Fallback: get any questions for this topic
        questions = Question.query.filter_by(topic_id=topic_id).order_by(
            db.func.random()
        ).limit(10).all()

    if not questions:
        return jsonify({'error': 'No questions available for this topic'}), 404

    session = QuizSession(
        student_id=student_id,
        topic_id=topic_id,
        difficulty_level=level
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({
        'session_id': session.id,
        'difficulty_level': level,
        'questions': [q.to_dict() for q in questions]
    })

@quiz_bp.route('/submit', methods=['POST'])
@jwt_required()
@student_required
def submit_quiz():
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

    total_score = 0
    max_score = len(answers)
    results = []

    for ans in answers:
        question_id = ans.get('question_id')
        student_answer = ans.get('answer', '')

        question = Question.query.get(question_id)
        if not question:
            continue

        # Evaluate
        eval_result = evaluate_response(question, student_answer)

        # Generate detailed feedback for wrong answers
        feedback = eval_result['feedback']
        if not eval_result['is_correct']:
            try:
                feedback = generate_feedback(question, student_answer)
            except Exception:
                pass

        response = StudentResponse(
            session_id=session_id,
            question_id=question_id,
            student_answer=student_answer,
            is_correct=eval_result['is_correct'],
            score=eval_result['score'],
            ai_feedback=feedback
        )
        db.session.add(response)
        total_score += eval_result['score']
        results.append(response)

    session.total_score = total_score
    session.max_score = max_score
    session.completed_at = datetime.utcnow()

    # Update adaptive difficulty
    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    update_performance(student_id, session.topic_id, percentage)

    # Update streak and XP
    from models.user import User
    user = User.query.get(student_id)
    if user:
        user.update_streak()
        xp_earned = int(total_score * session.difficulty_level * 10)
        user.add_xp(xp_earned)
    else:
        xp_earned = 0

    db.session.commit()

    return jsonify({
        'session': session.to_dict(),
        'percentage': round(percentage, 1),
        'xp_earned': xp_earned,
        'current_streak': user.current_streak if user else 0,
        'total_xp': user.total_xp if user else 0
    })

@quiz_bp.route('/session/<int:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    session = QuizSession.query.get_or_404(session_id)
    user_id = int(get_jwt_identity())
    if session.student_id != user_id:
        from models.user import User
        user = User.query.get(user_id)
        if not user or user.role != 'educator':
            return jsonify({'error': 'Not authorized'}), 403

    return jsonify({'session': session.to_dict()})

@quiz_bp.route('/history', methods=['GET'])
@jwt_required()
@student_required
def quiz_history():
    student_id = int(get_jwt_identity())
    sessions = QuizSession.query.filter_by(student_id=student_id).order_by(
        QuizSession.started_at.desc()
    ).limit(20).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]})
