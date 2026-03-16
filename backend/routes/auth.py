from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from models.user import User
from models.token_blacklist import TokenBlacklist
from utils.db import db
from utils.validators import validate_password, validate_email, validate_username
from app import limiter

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'student')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    # Validate username
    username_check = validate_username(username)
    if not username_check['valid']:
        return jsonify({'error': username_check['error']}), 400

    # Validate email
    email_check = validate_email(email)
    if not email_check['valid']:
        return jsonify({'error': email_check['error']}), 400

    # Validate password strength
    password_check = validate_password(password)
    if not password_check['valid']:
        return jsonify({'error': 'Password too weak', 'details': password_check['errors'], 'strength': password_check['strength']}), 400

    if role not in ('student', 'educator'):
        return jsonify({'error': 'Role must be student or educator'}), 400

    # Normalized error message to prevent user enumeration
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this username or email already exists'}), 409

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': new_access_token})


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jwt_data = get_jwt()
    jti = jwt_data['jti']
    user_id = int(get_jwt_identity())

    blacklisted = TokenBlacklist(
        jti=jti,
        token_type='access',
        user_id=user_id
    )
    db.session.add(blacklisted)
    db.session.commit()

    return jsonify({'message': 'Successfully logged out'})


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    password_check = validate_password(new_password)
    if not password_check['valid']:
        return jsonify({'error': 'New password too weak', 'details': password_check['errors']}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile (username and/or email)."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'username' in data:
        username = data['username'].strip()
        username_check = validate_username(username)
        if not username_check['valid']:
            return jsonify({'error': username_check['error']}), 400
        existing = User.query.filter_by(username=username).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Username already taken'}), 409
        user.username = username

    if 'email' in data:
        email = data['email'].strip()
        email_check = validate_email(email)
        if not email_check['valid']:
            return jsonify({'error': email_check['error']}), 400
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Email already in use'}), 409
        user.email = email

    db.session.commit()
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/validate-password', methods=['POST'])
def check_password_strength():
    data = request.get_json()
    password = data.get('password', '')
    result = validate_password(password)
    return jsonify(result)
