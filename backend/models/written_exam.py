from utils.db import db
from datetime import datetime
import json


class WrittenExam(db.Model):
    __tablename__ = 'written_exams'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_name = db.Column(db.String(300), nullable=False)
    topic_key = db.Column(db.String(300), nullable=False, index=True)
    essay_text = db.Column(db.Text, nullable=False)
    word_count = db.Column(db.Integer, nullable=False)
    time_taken_seconds = db.Column(db.Integer, nullable=True)

    # Scoring
    score = db.Column(db.Float, nullable=False)  # 0.0 - 100.0
    grade = db.Column(db.String(2), nullable=False)  # A+, A, B+, B, C, D, F

    # Key concept analysis (stored as JSON)
    key_concepts_expected = db.Column(db.Text, nullable=True)
    key_concepts_matched = db.Column(db.Text, nullable=True)
    key_concepts_missed = db.Column(db.Text, nullable=True)
    total_key_concepts = db.Column(db.Integer, default=0)
    matched_concept_count = db.Column(db.Integer, default=0)

    # Detailed feedback
    feedback = db.Column(db.Text, nullable=True)  # JSON

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref='written_exams')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'topic_name': self.topic_name,
            'essay_text': self.essay_text,
            'word_count': self.word_count,
            'time_taken_seconds': self.time_taken_seconds,
            'score': round(self.score, 1),
            'grade': self.grade,
            'key_concepts_expected': json.loads(self.key_concepts_expected) if self.key_concepts_expected else [],
            'key_concepts_matched': json.loads(self.key_concepts_matched) if self.key_concepts_matched else [],
            'key_concepts_missed': json.loads(self.key_concepts_missed) if self.key_concepts_missed else [],
            'total_key_concepts': self.total_key_concepts,
            'matched_concept_count': self.matched_concept_count,
            'feedback': json.loads(self.feedback) if self.feedback else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def to_summary(self):
        return {
            'id': self.id,
            'topic_name': self.topic_name,
            'score': round(self.score, 1),
            'grade': self.grade,
            'word_count': self.word_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
