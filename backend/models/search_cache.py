from utils.db import db
from datetime import datetime
import json

TTL_HOURS = 24
TTL_LOW_QUALITY = 6    # Low quality entries expire faster
TTL_HIGH_QUALITY = 48  # High quality entries last longer


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
    sources = db.Column(db.Text, nullable=True)  # JSON - source attribution
    quality_score = db.Column(db.Integer, default=0)  # 0-100 content quality
    source_type = db.Column(db.String(20), default='unknown')  # ai, web_only, mock
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def is_expired(self):
        if not self.created_at:
            return True
        elapsed = (datetime.utcnow() - self.created_at).total_seconds()
        # Dynamic TTL based on quality
        if self.quality_score and self.quality_score < 40:
            return elapsed > TTL_LOW_QUALITY * 3600
        elif self.quality_score and self.quality_score >= 80:
            return elapsed > TTL_HIGH_QUALITY * 3600
        return elapsed > TTL_HOURS * 3600

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
            'sources': json.loads(self.sources) if self.sources else [],
            'quality_score': self.quality_score or 0,
            'source_type': self.source_type or 'unknown',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
