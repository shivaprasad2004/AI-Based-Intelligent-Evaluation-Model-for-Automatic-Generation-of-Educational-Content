from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.topic import Topic
from services.web_search_service import get_topic_content

topic_content_bp = Blueprint('topic_content', __name__)


@topic_content_bp.route('/<int:topic_id>/content', methods=['GET'])
@jwt_required()
def fetch_topic_content(topic_id):
    """Fetch real-time internet content for a topic."""
    topic = Topic.query.get_or_404(topic_id)
    content = get_topic_content(topic.name, topic.description or '')
    return jsonify({
        'topic_id': topic.id,
        'topic_name': topic.name,
        'content': content
    })
