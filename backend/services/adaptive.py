from models.performance import PerformanceRecord
from models.response import QuizSession, StudentResponse
from models.question import Question
from models.topic import Topic
from utils.db import db


def get_student_level(student_id, topic_id):
    """Get the current difficulty level for a student on a topic."""
    record = PerformanceRecord.query.filter_by(
        student_id=student_id, topic_id=topic_id
    ).first()

    if not record:
        record = PerformanceRecord(student_id=student_id, topic_id=topic_id, current_level=1)
        db.session.add(record)
        db.session.commit()

    return record.current_level


def update_performance(student_id, topic_id, score_percentage):
    """Update performance and adjust difficulty level with enhanced adaptive logic.

    Rules:
    - score >= 80%: level up (max 5), recommend harder topics
    - score >= 60%: stay same, reinforce current level
    - score < 50%: level down (min 1), recommend easier questions and study material
    - score < 30%: level down more aggressively, flag for intervention
    """
    record = PerformanceRecord.query.filter_by(
        student_id=student_id, topic_id=topic_id
    ).first()

    if not record:
        record = PerformanceRecord(
            student_id=student_id,
            topic_id=topic_id,
            total_quizzes=0,
            average_score=0.0,
            current_level=1
        )
        db.session.add(record)

    record.total_quizzes = (record.total_quizzes or 0) + 1
    # Running average
    prev_avg = record.average_score or 0.0
    record.average_score = (
        (prev_avg * (record.total_quizzes - 1) + score_percentage)
        / record.total_quizzes
    )

    # Enhanced adaptive difficulty adjustment
    if score_percentage >= 80 and record.current_level < 5:
        record.current_level += 1
    elif score_percentage < 30 and record.current_level > 1:
        # Aggressive level down for very poor performance
        record.current_level = max(1, record.current_level - 2)
    elif score_percentage < 50 and record.current_level > 1:
        record.current_level -= 1

    db.session.commit()
    return record


def get_adaptive_recommendations(student_id):
    """Get personalized learning recommendations based on performance."""
    records = PerformanceRecord.query.filter_by(student_id=student_id).all()

    recommendations = {
        'weak_topics': [],
        'strong_topics': [],
        'suggested_actions': [],
        'difficulty_adjustments': []
    }

    for r in records:
        topic = Topic.query.get(r.topic_id)
        if not topic:
            continue

        topic_data = {
            'topic_id': r.topic_id,
            'topic_name': topic.name,
            'average_score': round(r.average_score, 1),
            'current_level': r.current_level,
            'total_quizzes': r.total_quizzes
        }

        if r.average_score < 50:
            recommendations['weak_topics'].append(topic_data)
            recommendations['suggested_actions'].append({
                'topic': topic.name,
                'action': 'review_basics',
                'message': f'Review fundamentals of {topic.name}. Your average score is {round(r.average_score)}%. Try easier quizzes first.'
            })
        elif r.average_score >= 80:
            recommendations['strong_topics'].append(topic_data)
            if r.current_level < 5:
                recommendations['suggested_actions'].append({
                    'topic': topic.name,
                    'action': 'increase_difficulty',
                    'message': f'Great job on {topic.name}! Try Level {r.current_level + 1} to challenge yourself.'
                })

    # Sort weak topics by score (worst first)
    recommendations['weak_topics'].sort(key=lambda x: x['average_score'])
    recommendations['strong_topics'].sort(key=lambda x: -x['average_score'])

    return recommendations


def detect_knowledge_gaps(student_id):
    """Analyze incorrect answers to identify specific weak concepts."""
    from sqlalchemy import func

    # Get all incorrect responses
    incorrect = db.session.query(
        Question.topic_id,
        Question.question_type,
        func.count(StudentResponse.id).label('wrong_count')
    ).join(StudentResponse, StudentResponse.question_id == Question.id).join(
        QuizSession, QuizSession.id == StudentResponse.session_id
    ).filter(
        QuizSession.student_id == student_id,
        StudentResponse.is_correct == False
    ).group_by(Question.topic_id, Question.question_type).all()

    # Get total attempts per topic
    total = db.session.query(
        Question.topic_id,
        func.count(StudentResponse.id).label('total_count')
    ).join(StudentResponse, StudentResponse.question_id == Question.id).join(
        QuizSession, QuizSession.id == StudentResponse.session_id
    ).filter(
        QuizSession.student_id == student_id
    ).group_by(Question.topic_id).all()

    total_map = {t.topic_id: t.total_count for t in total}

    gaps = []
    for row in incorrect:
        topic = Topic.query.get(row.topic_id)
        if not topic:
            continue
        total_for_topic = total_map.get(row.topic_id, 1)
        error_rate = round(row.wrong_count / total_for_topic * 100, 1)

        if error_rate > 30:  # Only flag if error rate > 30%
            gaps.append({
                'topic_id': row.topic_id,
                'topic_name': topic.name,
                'question_type': row.question_type,
                'wrong_count': row.wrong_count,
                'total_attempts': total_for_topic,
                'error_rate': error_rate
            })

    gaps.sort(key=lambda x: -x['error_rate'])
    return gaps


def calculate_similarity(text1, text2):
    """Calculate similarity between two texts for plagiarism detection."""
    if not text1 or not text2:
        return 0.0

    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())

    if not words1 or not words2:
        return 0.0

    intersection = words1 & words2
    union = words1 | words2

    jaccard = len(intersection) / len(union) if union else 0.0

    # Also check for exact substring matches
    shorter = text1 if len(text1) < len(text2) else text2
    longer = text2 if len(text1) < len(text2) else text1

    if shorter.lower().strip() in longer.lower().strip():
        return max(jaccard, 0.9)

    return jaccard
