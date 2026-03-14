from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import db
from utils.auth_helpers import student_required
from models.written_exam import WrittenExam
from models.user import User
from services.essay_evaluator import extract_key_concepts, evaluate_essay
import json

exam_bp = Blueprint('exam', __name__)


@exam_bp.route('/start', methods=['POST'])
@jwt_required()
@student_required
def start_exam():
    """Initialize an essay exam for a topic."""
    data = request.get_json()
    topic = data.get('topic', '').strip()

    if not topic or len(topic) < 2:
        return jsonify({'error': 'Topic must be at least 2 characters'}), 400

    # Extract key concepts to get count (don't expose them)
    concepts, _, _, _ = extract_key_concepts(topic)

    return jsonify({
        'topic': topic,
        'word_target': 300,
        'time_limit_seconds': 1800,  # 30 minutes
        'key_concept_count': len(concepts),
        'instructions': f'Write approximately 300 words about "{topic}". Cover the key concepts, definitions, applications, and significance of the topic. You have 30 minutes.'
    })


@exam_bp.route('/submit', methods=['POST'])
@jwt_required()
@student_required
def submit_exam():
    """Submit and evaluate an essay exam."""
    data = request.get_json()
    topic = data.get('topic', '').strip()
    essay_text = data.get('essay_text', '').strip()
    time_taken = data.get('time_taken_seconds', 0)

    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
    if not essay_text:
        return jsonify({'error': 'Essay text is required'}), 400

    word_count = len(essay_text.split())
    if word_count < 50:
        return jsonify({'error': 'Essay must be at least 50 words'}), 400

    student_id = int(get_jwt_identity())

    # Extract key concepts from internet sources
    key_concepts, concept_details, wiki_data, ddg_data = extract_key_concepts(topic)

    # Evaluate the essay
    result = evaluate_essay(essay_text, topic, key_concepts, wiki_data)

    # Save to database
    exam = WrittenExam(
        student_id=student_id,
        topic_name=topic,
        topic_key=topic.lower(),
        essay_text=essay_text,
        word_count=word_count,
        time_taken_seconds=time_taken,
        score=result['score'],
        grade=result['grade'],
        key_concepts_expected=json.dumps(key_concepts),
        key_concepts_matched=json.dumps(result['matched']),
        key_concepts_missed=json.dumps(result['missed']),
        total_key_concepts=result['total_concepts'],
        matched_concept_count=result['matched_count'],
        feedback=json.dumps(result['feedback'])
    )
    db.session.add(exam)

    # Award XP
    user = User.query.get(student_id)
    xp_earned = 0
    if user:
        user.update_streak()
        xp_earned = int(result['score'] / 100 * 50)
        user.add_xp(xp_earned)

    db.session.commit()

    return jsonify({
        'exam_id': exam.id,
        'topic': topic,
        'score': result['score'],
        'grade': result['grade'],
        'word_count': word_count,
        'time_taken_seconds': time_taken,
        'matched_count': result['matched_count'],
        'total_concepts': result['total_concepts'],
        'feedback': result['feedback'],
        'xp_earned': xp_earned,
        'current_streak': user.current_streak if user else 0,
        'total_xp': user.total_xp if user else 0
    })


@exam_bp.route('/history', methods=['GET'])
@jwt_required()
@student_required
def exam_history():
    """Get essay exam history for the current student."""
    student_id = int(get_jwt_identity())
    exams = WrittenExam.query.filter_by(student_id=student_id).order_by(
        WrittenExam.created_at.desc()
    ).all()

    return jsonify({
        'exams': [e.to_summary() for e in exams]
    })


@exam_bp.route('/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    """Get full details of a specific exam."""
    student_id = int(get_jwt_identity())
    exam = WrittenExam.query.get_or_404(exam_id)

    if exam.student_id != student_id:
        return jsonify({'error': 'Not authorized'}), 403

    return jsonify(exam.to_dict())
