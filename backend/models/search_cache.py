from utils.db import db
from datetime import datetime
import json


class TopicSearchCache(db.Model):
    __tablename__ = 'topic_search_cache'

    id = db.Column(db.Integer, primary_key=True)
    topic_key = db.Column(db.String(300), unique=True, nullable=False, index=True)
    topic_name = db.Column(db.String(300), nullable=False)
    overview = db.Column(db.Text, nullable=True)
    key_concepts = db.Column(db.Text, nullable=True)  # JSON
    examples = db.Column(db.Text, nullable=True)  # JSON
    study_material = db.Column(db.Text, nullable=True)
    wikipedia_url = db.Column(db.String(500), nullable=True)
    wikipedia_title = db.Column(db.String(300), nullable=True)
    web_resources = db.Column(db.Text, nullable=True)  # JSON
    related_topics = db.Column(db.Text, nullable=True)  # JSON
    infobox = db.Column(db.Text, nullable=True)  # JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic_name,
            'overview': self.overview,
            'key_concepts': json.loads(self.key_concepts) if self.key_concepts else [],
            'examples': json.loads(self.examples) if self.examples else [],
            'study_material': self.study_material,
            'wikipedia_url': self.wikipedia_url or '',
            'wikipedia_title': self.wikipedia_title or self.topic_name,
            'web_resources': json.loads(self.web_resources) if self.web_resources else [],
            'related_topics': json.loads(self.related_topics) if self.related_topics else [],
            'infobox': json.loads(self.infobox) if self.infobox else {},
            'created_at': self.created_at.isoformat()
        }
