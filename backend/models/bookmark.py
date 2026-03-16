from utils.db import db
from datetime import datetime

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bookmark_type = db.Column(db.String(20), nullable=False)  # 'topic', 'question', 'pyq'
    item_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'bookmark_type', 'item_id', name='uq_user_bookmark'),
        db.Index('idx_user_bookmark_type', 'user_id', 'bookmark_type'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bookmark_type': self.bookmark_type,
            'item_id': self.item_id,
            'created_at': self.created_at.isoformat()
        }
