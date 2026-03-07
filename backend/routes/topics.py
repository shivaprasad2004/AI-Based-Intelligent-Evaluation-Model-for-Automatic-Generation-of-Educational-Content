from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.topic import Topic
from models.user import User
from utils.db import db
from utils.auth_helpers import educator_required

topics_bp = Blueprint('topics', __name__)

@topics_bp.route('/', methods=['GET'])
@jwt_required()
def get_topics():
    topics = Topic.query.all()
    return jsonify({'topics': [t.to_dict() for t in topics]})

@topics_bp.route('/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic(topic_id):
    topic = Topic.query.get_or_404(topic_id)
    return jsonify({'topic': topic.to_dict()})

@topics_bp.route('/', methods=['POST'])
@jwt_required()
@educator_required
def create_topic():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Topic name is required'}), 400

    user_id = int(get_jwt_identity())
    topic = Topic(
        name=data['name'].strip(),
        description=data.get('description', '').strip(),
        creator_id=user_id,
        category_id=data.get('category_id'),
        tags=data.get('tags', '')
    )
    db.session.add(topic)
    db.session.commit()
    return jsonify({'topic': topic.to_dict()}), 201

@topics_bp.route('/<int:topic_id>', methods=['PUT'])
@jwt_required()
@educator_required
def update_topic(topic_id):
    topic = Topic.query.get_or_404(topic_id)
    user_id = int(get_jwt_identity())
    if topic.creator_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    data = request.get_json()
    if data.get('name'):
        topic.name = data['name'].strip()
    if 'description' in data:
        topic.description = data['description'].strip()

    db.session.commit()
    return jsonify({'topic': topic.to_dict()})

@topics_bp.route('/<int:topic_id>', methods=['DELETE'])
@jwt_required()
@educator_required
def delete_topic(topic_id):
    topic = Topic.query.get_or_404(topic_id)
    user_id = int(get_jwt_identity())
    if topic.creator_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    db.session.delete(topic)
    db.session.commit()
    return jsonify({'message': 'Topic deleted'})
