from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.response import QuizSession, StudentResponse
from models.performance import PerformanceRecord
from models.question import Question
from models.topic import Topic
from utils.db import db
from utils.auth_helpers import educator_required, student_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/student/overview', methods=['GET'])
@jwt_required()
@student_required
def student_overview():
    student_id = int(get_jwt_identity())

    sessions = QuizSession.query.filter_by(student_id=student_id).filter(
        QuizSession.completed_at.isnot(None)
    ).order_by(QuizSession.completed_at.desc()).all()

    performances = PerformanceRecord.query.filter_by(student_id=student_id).all()

    # Score over time
    score_history = []
    for s in sessions:
        if s.total_score is not None and s.max_score:
            score_history.append({
                'date': s.completed_at.isoformat(),
                'score': round(s.total_score / s.max_score * 100, 1),
                'topic': s.topic.name if s.topic else 'Unknown'
            })

    # Topic strengths
    topic_stats = {}
    for p in performances:
        topic_stats[p.topic.name if p.topic else 'Unknown'] = {
            'level': p.current_level,
            'average_score': round(p.average_score, 1),
            'quizzes_taken': p.total_quizzes
        }

    return jsonify({
        'total_quizzes': len(sessions),
        'score_history': list(reversed(score_history)),
        'topic_strengths': topic_stats,
        'performance_records': [p.to_dict() for p in performances]
    })

@analytics_bp.route('/student/recent-quizzes', methods=['GET'])
@jwt_required()
@student_required
def student_recent_quizzes():
    student_id = int(get_jwt_identity())
    sessions = QuizSession.query.filter_by(student_id=student_id).filter(
        QuizSession.completed_at.isnot(None)
    ).order_by(QuizSession.completed_at.desc()).limit(10).all()

    results = []
    for s in sessions:
        topic = Topic.query.get(s.topic_id)
        percentage = round((s.total_score / s.max_score * 100), 1) if s.max_score and s.max_score > 0 else 0
        results.append({
            'session_id': s.id,
            'topic_name': topic.name if topic else 'Unknown',
            'topic_id': s.topic_id,
            'score': s.total_score,
            'max_score': s.max_score,
            'percentage': percentage,
            'difficulty_level': s.difficulty_level,
            'completed_at': s.completed_at.isoformat() if s.completed_at else None
        })
    return jsonify({'recent_quizzes': results})


@analytics_bp.route('/student/topic-progress', methods=['GET'])
@jwt_required()
@student_required
def student_topic_progress():
    student_id = int(get_jwt_identity())
    records = PerformanceRecord.query.filter_by(student_id=student_id).all()
    progress = []
    for r in records:
        topic = Topic.query.get(r.topic_id)
        progress.append({
            'topic_id': r.topic_id,
            'topic_name': topic.name if topic else 'Unknown',
            'total_quizzes': r.total_quizzes,
            'average_score': round(r.average_score, 1),
            'current_level': r.current_level,
            'last_updated': r.last_updated.isoformat() if r.last_updated else None
        })
    return jsonify({'topic_progress': progress})


@analytics_bp.route('/student/score-trend', methods=['GET'])
@jwt_required()
@student_required
def student_score_trend():
    student_id = int(get_jwt_identity())
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    sessions = QuizSession.query.filter(
        QuizSession.student_id == student_id,
        QuizSession.completed_at.isnot(None),
        QuizSession.completed_at >= thirty_days_ago
    ).order_by(QuizSession.completed_at.asc()).all()

    trend = []
    for s in sessions:
        percentage = round((s.total_score / s.max_score * 100), 1) if s.max_score and s.max_score > 0 else 0
        trend.append({
            'date': s.completed_at.strftime('%Y-%m-%d'),
            'score': percentage,
            'topic_id': s.topic_id
        })
    return jsonify({'score_trend': trend})


@analytics_bp.route('/educator/overview', methods=['GET'])
@jwt_required()
@educator_required
def educator_overview():
    user_id = int(get_jwt_identity())

    # Topics created by this educator
    topics = Topic.query.filter_by(creator_id=user_id).all()
    topic_ids = [t.id for t in topics]

    # All sessions for these topics
    sessions = QuizSession.query.filter(
        QuizSession.topic_id.in_(topic_ids),
        QuizSession.completed_at.isnot(None)
    ).all()

    # Class-wide stats per topic
    topic_analytics = []
    for topic in topics:
        topic_sessions = [s for s in sessions if s.topic_id == topic.id]
        if topic_sessions:
            scores = [s.total_score / s.max_score * 100 for s in topic_sessions if s.max_score]
            avg = sum(scores) / len(scores) if scores else 0
        else:
            scores = []
            avg = 0

        # Question effectiveness
        questions = Question.query.filter_by(topic_id=topic.id).all()
        q_stats = []
        for q in questions:
            responses = StudentResponse.query.filter_by(question_id=q.id).all()
            if responses:
                correct = sum(1 for r in responses if r.is_correct)
                q_stats.append({
                    'question_id': q.id,
                    'question_text': q.question_text[:80],
                    'type': q.question_type,
                    'difficulty': q.difficulty,
                    'attempts': len(responses),
                    'correct_rate': round(correct / len(responses) * 100, 1)
                })

        topic_analytics.append({
            'topic_id': topic.id,
            'topic_name': topic.name,
            'total_students': len(set(s.student_id for s in topic_sessions)),
            'total_attempts': len(topic_sessions),
            'average_score': round(avg, 1),
            'question_count': len(questions),
            'question_stats': q_stats
        })

    return jsonify({
        'topics': topic_analytics,
        'total_topics': len(topics),
        'total_sessions': len(sessions)
    })
