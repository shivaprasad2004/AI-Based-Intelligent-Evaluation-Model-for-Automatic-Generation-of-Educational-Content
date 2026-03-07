from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from models.user import User
from models.response import QuizSession
from utils.db import db

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('/', methods=['GET'])
@jwt_required()
def get_leaderboard():
    period = request.args.get('period', 'all')
    limit = min(int(request.args.get('limit', 20)), 50)

    if period == 'weekly':
        since = datetime.utcnow() - timedelta(days=7)
    elif period == 'monthly':
        since = datetime.utcnow() - timedelta(days=30)
    else:
        since = None

    if since:
        # Leaderboard based on quiz scores in the period
        results = db.session.query(
            User.id,
            User.username,
            User.total_xp,
            User.current_streak,
            db.func.count(QuizSession.id).label('quiz_count'),
            db.func.avg(
                db.case(
                    (QuizSession.max_score > 0,
                     QuizSession.total_score / QuizSession.max_score * 100),
                    else_=0
                )
            ).label('avg_score')
        ).join(QuizSession, User.id == QuizSession.student_id)\
         .filter(QuizSession.completed_at >= since)\
         .group_by(User.id)\
         .order_by(db.desc('avg_score'))\
         .limit(limit).all()
    else:
        # All-time leaderboard by XP
        results = db.session.query(
            User.id,
            User.username,
            User.total_xp,
            User.current_streak,
            db.func.count(QuizSession.id).label('quiz_count'),
            db.func.avg(
                db.case(
                    (QuizSession.max_score > 0,
                     QuizSession.total_score / QuizSession.max_score * 100),
                    else_=0
                )
            ).label('avg_score')
        ).outerjoin(QuizSession, User.id == QuizSession.student_id)\
         .filter(User.role == 'student')\
         .group_by(User.id)\
         .order_by(db.desc(User.total_xp))\
         .limit(limit).all()

    leaderboard = []
    for i, r in enumerate(results):
        leaderboard.append({
            'rank': i + 1,
            'user_id': r.id,
            'username': r.username,
            'total_xp': r.total_xp or 0,
            'current_streak': r.current_streak or 0,
            'quiz_count': r.quiz_count or 0,
            'avg_score': round(float(r.avg_score or 0), 1)
        })

    return jsonify({'leaderboard': leaderboard, 'period': period})

@leaderboard_bp.route('/topic/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic_leaderboard(topic_id):
    results = db.session.query(
        User.id,
        User.username,
        db.func.count(QuizSession.id).label('quiz_count'),
        db.func.avg(
            db.case(
                (QuizSession.max_score > 0,
                 QuizSession.total_score / QuizSession.max_score * 100),
                else_=0
            )
        ).label('avg_score')
    ).join(QuizSession, User.id == QuizSession.student_id)\
     .filter(QuizSession.topic_id == topic_id, QuizSession.completed_at.isnot(None))\
     .group_by(User.id)\
     .order_by(db.desc('avg_score'))\
     .limit(20).all()

    leaderboard = []
    for i, r in enumerate(results):
        leaderboard.append({
            'rank': i + 1,
            'user_id': r.id,
            'username': r.username,
            'quiz_count': r.quiz_count or 0,
            'avg_score': round(float(r.avg_score or 0), 1)
        })

    return jsonify({'leaderboard': leaderboard, 'topic_id': topic_id})
