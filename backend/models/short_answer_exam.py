from utils.db import db
from datetime import datetime
import json


class ShortAnswerExam(db.Model):
    __tablename__ = 'short_answer_exams'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_name = db.Column(db.String(300), nullable=False)
    topic_key = db.Column(db.String(300), nullable=False, index=True)

    # Questions and answers stored as JSON
    questions_data = db.Column(db.Text, nullable=False)  # JSON array of {question, correct_answer, keywords}
    answers_data = db.Column(db.Text, nullable=False)  # JSON array of {question_index, student_answer, score, feedback, matched_keywords, missed_keywords}

    total_questions = db.Column(db.Integer, nullable=False)
    total_score = db.Column(db.Float, nullable=False)  # 0-100
    grade = db.Column(db.String(2), nullable=False)
    time_taken_seconds = db.Column(db.Integer, nullable=True)

    feedback = db.Column(db.Text, nullable=True)  # JSON overall feedback

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref='short_answer_exams')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'topic_name': self.topic_name,
            'questions': json.loads(self.questions_data) if self.questions_data else [],
            'answers': json.loads(self.answers_data) if self.answers_data else [],
            'total_questions': self.total_questions,
            'total_score': round(self.total_score, 1),
            'grade': self.grade,
            'time_taken_seconds': self.time_taken_seconds,
            'feedback': json.loads(self.feedback) if self.feedback else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def to_summary(self):
        return {
            'id': self.id,
            'topic_name': self.topic_name,
            'total_score': round(self.total_score, 1),
            'grade': self.grade,
            'total_questions': self.total_questions,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
