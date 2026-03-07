from utils.db import db
from datetime import datetime

class QuizSession(db.Model):
    __tablename__ = 'quiz_sessions'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    difficulty_level = db.Column(db.Integer, default=1)
    total_score = db.Column(db.Float, nullable=True)
    max_score = db.Column(db.Float, nullable=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    responses = db.relationship('StudentResponse', backref='session', lazy=True, cascade='all, delete-orphan')
    topic = db.relationship('Topic', backref='quiz_sessions')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'topic_id': self.topic_id,
            'topic_name': self.topic.name if self.topic else None,
            'difficulty_level': self.difficulty_level,
            'total_score': self.total_score,
            'max_score': self.max_score,
            'percentage': round((self.total_score / self.max_score) * 100, 1) if self.total_score is not None and self.max_score else None,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'responses': [r.to_dict() for r in self.responses]
        }


class StudentResponse(db.Model):
    __tablename__ = 'student_responses'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    student_answer = db.Column(db.Text, nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    score = db.Column(db.Float, nullable=True)  # 0.0 to 1.0
    ai_feedback = db.Column(db.Text, nullable=True)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'question_id': self.question_id,
            'question': self.question.to_dict(include_answer=True) if self.question else None,
            'student_answer': self.student_answer,
            'is_correct': self.is_correct,
            'score': self.score,
            'ai_feedback': self.ai_feedback,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None
        }
