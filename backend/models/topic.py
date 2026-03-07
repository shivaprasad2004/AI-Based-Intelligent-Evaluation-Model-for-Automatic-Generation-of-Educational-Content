from utils.db import db
from datetime import datetime

class Topic(db.Model):
    __tablename__ = 'topics'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    is_system = db.Column(db.Boolean, default=False)
    tags = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship('Question', backref='topic', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator_id': self.creator_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'is_system': self.is_system,
            'tags': self.tags,
            'created_at': self.created_at.isoformat(),
            'question_count': len(self.questions),
            'pyq_count': len(self.pyqs) if hasattr(self, 'pyqs') else 0
        }
