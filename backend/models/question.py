from utils.db import db
from datetime import datetime
import json

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    question_type = db.Column(db.String(20), nullable=False)  # mcq, short_answer, essay, fill_blank, true_false
    difficulty = db.Column(db.Integer, default=1)  # 1-5
    question_text = db.Column(db.Text, nullable=False)
    options_json = db.Column(db.Text, nullable=True)  # JSON string for MCQ options
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    responses = db.relationship('StudentResponse', backref='question', lazy=True)

    @property
    def options(self):
        if self.options_json:
            return json.loads(self.options_json)
        return None

    @options.setter
    def options(self, value):
        if value:
            self.options_json = json.dumps(value)
        else:
            self.options_json = None

    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'topic_id': self.topic_id,
            'question_type': self.question_type,
            'difficulty': self.difficulty,
            'question_text': self.question_text,
            'options': self.options,
            'created_at': self.created_at.isoformat()
        }
        if include_answer:
            data['correct_answer'] = self.correct_answer
            data['explanation'] = self.explanation
        return data
