import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.category import PreviousYearQuestion
from models.topic import Topic
from utils.db import db
from utils.auth_helpers import educator_required
from services.ai_service import get_ai_response, parse_json_response

pyq_bp = Blueprint('pyq', __name__)

@pyq_bp.route('/topic/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_pyqs(topic_id):
    Topic.query.get_or_404(topic_id)
    query = PreviousYearQuestion.query.filter_by(topic_id=topic_id)

    exam = request.args.get('exam')
    year = request.args.get('year')
    if exam:
        query = query.filter_by(exam_name=exam)
    if year:
        query = query.filter_by(year=int(year))

    pyqs = query.order_by(PreviousYearQuestion.year.desc()).all()
    return jsonify({'pyqs': [p.to_dict() for p in pyqs]})

@pyq_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    exams = db.session.query(PreviousYearQuestion.exam_name).distinct().all()
    return jsonify({'exams': [e[0] for e in exams]})

@pyq_bp.route('/generate', methods=['POST'])
@jwt_required()
@educator_required
def generate_pyqs():
    data = request.get_json()
    topic_id = data.get('topic_id')
    exam_name = data.get('exam_name', 'General Exam')
    count = min(data.get('count', 3), 10)

    topic = Topic.query.get_or_404(topic_id)

    prompt = f"""Generate {count} previous year exam-style questions for the topic "{topic.name}"
for the exam "{exam_name}". Return as JSON array with fields:
- question_text (string)
- options (array of 4 strings for MCQ)
- correct_answer (string)
- explanation (string)
- difficulty (integer 1-5)
- year (integer, use recent years like 2022-2024)"""

    try:
        response = get_ai_response(prompt)
        questions_data = parse_json_response(response)
        if not isinstance(questions_data, list):
            questions_data = questions_data.get('questions', [])
    except Exception:
        # Fallback mock PYQs
        questions_data = [
            {
                'question_text': f'Sample {exam_name} question about {topic.name} (Q{i+1})',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'Option A',
                'explanation': f'This is a sample explanation for {topic.name}.',
                'difficulty': 3,
                'year': 2023
            }
            for i in range(count)
        ]

    created = []
    for q in questions_data[:count]:
        pyq = PreviousYearQuestion(
            topic_id=topic_id,
            exam_name=exam_name,
            year=q.get('year', 2023),
            question_text=q['question_text'],
            options_json=json.dumps(q['options']) if q.get('options') else None,
            correct_answer=q['correct_answer'],
            explanation=q.get('explanation'),
            difficulty=q.get('difficulty', 3)
        )
        db.session.add(pyq)
        created.append(pyq)

    db.session.commit()
    return jsonify({'pyqs': [p.to_dict() for p in created], 'count': len(created)}), 201
