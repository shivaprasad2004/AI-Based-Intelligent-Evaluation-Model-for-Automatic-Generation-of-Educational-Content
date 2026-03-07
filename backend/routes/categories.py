from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.category import Category
from models.topic import Topic
from utils.db import db
from utils.auth_helpers import educator_required

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.sort_order).all()
    return jsonify({'categories': [c.to_dict() for c in categories]})

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get_or_404(category_id)
    return jsonify({'category': category.to_dict()})

@categories_bp.route('/', methods=['POST'])
@jwt_required()
@educator_required
def create_category():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Category name is required'}), 400

    name = data['name'].strip()
    slug = name.lower().replace(' ', '-')

    if Category.query.filter_by(slug=slug).first():
        return jsonify({'error': 'Category already exists'}), 409

    category = Category(
        name=name,
        slug=slug,
        icon=data.get('icon', ''),
        description=data.get('description', ''),
        target_audience=data.get('target_audience', 'all'),
        sort_order=data.get('sort_order', 0)
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({'category': category.to_dict()}), 201
