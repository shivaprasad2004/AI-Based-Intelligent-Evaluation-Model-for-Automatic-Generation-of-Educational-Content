from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.topic import Topic
from models.question import Question
from services.question_generator import generate_questions
from utils.db import db
from utils.auth_helpers import educator_required

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('/topic/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_questions(topic_id):
    topic = Topic.query.get_or_404(topic_id)
    questions = Question.query.filter_by(topic_id=topic_id).all()
    user_id = int(get_jwt_identity())
    from models.user import User
    user = User.query.get(user_id)
    include_answer = user and user.role == 'educator'
    return jsonify({'questions': [q.to_dict(include_answer=include_answer) for q in questions]})

@questions_bp.route('/generate', methods=['POST'])
@jwt_required()
@educator_required
def generate():
    data = request.get_json()
    if not data or not data.get('topic_id'):
        return jsonify({'error': 'topic_id is required'}), 400

    topic = Topic.query.get_or_404(data['topic_id'])
    difficulty = data.get('difficulty', 1)
    count = min(data.get('count', 5), 20)
    types = data.get('types', None)

    try:
        questions = generate_questions(
            topic_name=topic.name,
            topic_description=topic.description,
            difficulty=difficulty,
            count=count,
            types=types
        )

        for q in questions:
            q.topic_id = topic.id
            db.session.add(q)
        db.session.commit()

        return jsonify({
            'message': f'{len(questions)} questions generated',
            'questions': [q.to_dict(include_answer=True) for q in questions]
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
@jwt_required()
@educator_required
def delete_question(question_id):
    question = Question.query.get_or_404(question_id)
    db.session.delete(question)
    db.session.commit()
    return jsonify({'message': 'Question deleted'})
