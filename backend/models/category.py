from utils.db import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(10), nullable=True)
    description = db.Column(db.Text, nullable=True)
    target_audience = db.Column(db.String(50), nullable=True)  # school, college, all
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    topics = db.relationship('Topic', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'description': self.description,
            'target_audience': self.target_audience,
            'sort_order': self.sort_order,
            'topic_count': len(self.topics),
            'topics': [t.to_dict() for t in self.topics]
        }


class PreviousYearQuestion(db.Model):
    __tablename__ = 'previous_year_questions'

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    exam_name = db.Column(db.String(200), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options_json = db.Column(db.Text, nullable=True)
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.Integer, default=3)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    topic = db.relationship('Topic', backref='pyqs')

    @property
    def options(self):
        if self.options_json:
            import json
            return json.loads(self.options_json)
        return None

    def to_dict(self):
        return {
            'id': self.id,
            'topic_id': self.topic_id,
            'topic_name': self.topic.name if self.topic else None,
            'exam_name': self.exam_name,
            'year': self.year,
            'question_text': self.question_text,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'difficulty': self.difficulty
        }
