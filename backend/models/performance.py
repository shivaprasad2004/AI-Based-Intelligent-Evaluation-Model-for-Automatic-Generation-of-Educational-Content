from utils.db import db
from datetime import datetime

class PerformanceRecord(db.Model):
    __tablename__ = 'performance_records'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    current_level = db.Column(db.Integer, default=1)  # 1-5
    total_quizzes = db.Column(db.Integer, default=0)
    average_score = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    topic = db.relationship('Topic', backref='performance_records')

    __table_args__ = (
        db.UniqueConstraint('student_id', 'topic_id', name='unique_student_topic'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'topic_id': self.topic_id,
            'topic_name': self.topic.name if self.topic else None,
            'current_level': self.current_level,
            'total_quizzes': self.total_quizzes,
            'average_score': round(self.average_score, 1),
            'last_updated': self.last_updated.isoformat()
        }
