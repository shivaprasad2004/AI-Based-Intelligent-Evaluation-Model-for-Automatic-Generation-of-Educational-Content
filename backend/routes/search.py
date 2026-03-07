from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.category import Category, PreviousYearQuestion
from models.topic import Topic
from models.question import Question
from services.ai_service import _fetch_wikipedia, _fetch_duckduckgo
import re

search_bp = Blueprint('search', __name__)

# Need to import db for or_ queries
from utils.db import db


@search_bp.route('/', methods=['GET'])
@jwt_required()
def search():
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify({'error': 'Search query must be at least 2 characters'}), 400

    search_term = f'%{query}%'

    # Search categories
    categories = Category.query.filter(
        db.or_(
            Category.name.ilike(search_term),
            Category.description.ilike(search_term)
        )
    ).limit(5).all()

    # Search topics
    topics = Topic.query.filter(
        db.or_(
            Topic.name.ilike(search_term),
            Topic.description.ilike(search_term),
            Topic.tags.ilike(search_term)
        )
    ).limit(10).all()

    # Search questions
    questions = Question.query.filter(
        Question.question_text.ilike(search_term)
    ).limit(10).all()

    # Search PYQs
    pyqs = PreviousYearQuestion.query.filter(
        db.or_(
            PreviousYearQuestion.question_text.ilike(search_term),
            PreviousYearQuestion.exam_name.ilike(search_term)
        )
    ).limit(10).all()

    # Generate REAL AI summary from Wikipedia
    ai_summary = None
    try:
        wiki = _fetch_wikipedia(query)
        if wiki and wiki.get('summary'):
            sentences = re.split(r'(?<=[.!?])\s+', wiki['summary'])
            ai_summary = ' '.join(sentences[:4])
        else:
            ddg = _fetch_duckduckgo(query)
            if ddg and ddg.get('abstract'):
                ai_summary = ddg['abstract']
    except Exception:
        ai_summary = None

    # Recommend quizzes (topics with questions)
    recommended_topics = Topic.query.filter(
        db.or_(
            Topic.name.ilike(search_term),
            Topic.tags.ilike(search_term)
        )
    ).all()
    recommended_quizzes = [t.to_dict() for t in recommended_topics if len(t.questions) > 0]

    return jsonify({
        'query': query,
        'ai_summary': ai_summary,
        'categories': [c.to_dict() for c in categories],
        'topics': [t.to_dict() for t in topics],
        'questions': [q.to_dict(include_answer=True) for q in questions],
        'pyqs': [p.to_dict() for p in pyqs],
        'recommended_quizzes': recommended_quizzes[:5],
        'total_results': len(categories) + len(topics) + len(questions) + len(pyqs)
    })
