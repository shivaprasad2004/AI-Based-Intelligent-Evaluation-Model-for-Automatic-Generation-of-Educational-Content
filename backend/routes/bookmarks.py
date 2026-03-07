from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.bookmark import Bookmark
from models.topic import Topic
from models.question import Question
from models.category import PreviousYearQuestion
from utils.db import db

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_bookmark():
    data = request.get_json()
    bookmark_type = data.get('bookmark_type')
    item_id = data.get('item_id')

    if not bookmark_type or not item_id:
        return jsonify({'error': 'bookmark_type and item_id are required'}), 400
    if bookmark_type not in ('topic', 'question', 'pyq'):
        return jsonify({'error': 'Invalid bookmark_type'}), 400

    user_id = int(get_jwt_identity())

    existing = Bookmark.query.filter_by(
        user_id=user_id, bookmark_type=bookmark_type, item_id=item_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'bookmarked': False, 'message': 'Bookmark removed'})
    else:
        bookmark = Bookmark(user_id=user_id, bookmark_type=bookmark_type, item_id=item_id)
        db.session.add(bookmark)
        db.session.commit()
        return jsonify({'bookmarked': True, 'message': 'Bookmark added', 'bookmark': bookmark.to_dict()})

@bookmarks_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookmarks():
    user_id = int(get_jwt_identity())
    bookmark_type = request.args.get('type')

    query = Bookmark.query.filter_by(user_id=user_id)
    if bookmark_type:
        query = query.filter_by(bookmark_type=bookmark_type)

    bookmarks = query.order_by(Bookmark.created_at.desc()).all()

    result = []
    for b in bookmarks:
        item_data = b.to_dict()
        # Resolve the actual item
        if b.bookmark_type == 'topic':
            item = Topic.query.get(b.item_id)
            if item:
                item_data['item'] = item.to_dict()
        elif b.bookmark_type == 'question':
            item = Question.query.get(b.item_id)
            if item:
                item_data['item'] = item.to_dict(include_answer=True)
        elif b.bookmark_type == 'pyq':
            item = PreviousYearQuestion.query.get(b.item_id)
            if item:
                item_data['item'] = item.to_dict()
        result.append(item_data)

    return jsonify({'bookmarks': result})

@bookmarks_bp.route('/check', methods=['GET'])
@jwt_required()
def check_bookmark():
    user_id = int(get_jwt_identity())
    bookmark_type = request.args.get('type')
    item_id = request.args.get('item_id')

    if not bookmark_type or not item_id:
        return jsonify({'error': 'type and item_id are required'}), 400

    exists = Bookmark.query.filter_by(
        user_id=user_id, bookmark_type=bookmark_type, item_id=int(item_id)
    ).first() is not None

    return jsonify({'bookmarked': exists})
