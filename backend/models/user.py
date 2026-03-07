from utils.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student' or 'educator'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Streak & XP fields
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_quiz_date = db.Column(db.Date, nullable=True)
    total_xp = db.Column(db.Integer, default=0)

    topics = db.relationship('Topic', backref='creator', lazy=True)
    quiz_sessions = db.relationship('QuizSession', backref='student', lazy=True)
    performance_records = db.relationship('PerformanceRecord', backref='student', lazy=True)
    bookmarks = db.relationship('Bookmark', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def update_streak(self):
        today = date.today()
        if self.last_quiz_date == today:
            return  # Already quizzed today
        if self.last_quiz_date and (today - self.last_quiz_date).days == 1:
            self.current_streak += 1
        else:
            self.current_streak = 1
        self.last_quiz_date = today
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

    def add_xp(self, amount):
        self.total_xp += amount

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'current_streak': self.current_streak or 0,
            'longest_streak': self.longest_streak or 0,
            'total_xp': self.total_xp or 0,
            'last_quiz_date': self.last_quiz_date.isoformat() if self.last_quiz_date else None
        }
