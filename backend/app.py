from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from config import Config
from utils.db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

    CORS(app, origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], supports_credentials=True)
    db.init_app(app)
    JWTManager(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.topics import topics_bp
    from routes.questions import questions_bp
    from routes.quiz import quiz_bp
    from routes.analytics import analytics_bp
    from routes.categories import categories_bp
    from routes.search import search_bp
    from routes.pyq import pyq_bp
    from routes.leaderboard import leaderboard_bp
    from routes.bookmarks import bookmarks_bp
    from routes.topic_content import topic_content_bp
    from routes.chatbot import chatbot_bp
    from routes.dynamic_search import dynamic_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(topics_bp, url_prefix='/api/topics')
    app.register_blueprint(topic_content_bp, url_prefix='/api/topics')
    app.register_blueprint(questions_bp, url_prefix='/api/questions')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(pyq_bp, url_prefix='/api/pyq')
    app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
    app.register_blueprint(bookmarks_bp, url_prefix='/api/bookmarks')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(dynamic_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    with app.app_context():
        db.create_all()
        from seeds import seed_database
        seed_database()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
