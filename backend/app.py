from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import timedelta, datetime
from config import Config, config_by_env
from utils.db import db
from utils.logger import setup_logger
import os

limiter = Limiter(key_func=get_remote_address, default_limits=["200 per hour"], storage_uri="memory://")

def create_app():
    app = Flask(__name__)
    env = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config_by_env.get(env, Config))
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

    # Setup logging
    setup_logger(app)

    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']), supports_credentials=True)
    db.init_app(app)
    limiter.init_app(app)

    jwt = JWTManager(app)

    # Token blacklist checker
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        from models.token_blacklist import TokenBlacklist
        jti = jwt_payload['jti']
        token = TokenBlacklist.query.filter_by(jti=jti).first()
        return token is not None

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
    from routes.exam import exam_bp
    from routes.short_answer_exam import short_answer_exam_bp

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
    app.register_blueprint(exam_bp, url_prefix='/api/exam')
    app.register_blueprint(short_answer_exam_bp, url_prefix='/api/short-answer-exam')

    # Global error handlers
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {error}")
        return jsonify({'error': 'An internal error occurred. Please try again.'}), 500

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.route('/api/health')
    def health():
        status = {'status': 'ok', 'services': {}}
        try:
            db.session.execute(db.text('SELECT 1'))
            status['services']['database'] = 'ok'
        except Exception:
            status['services']['database'] = 'error'
            status['status'] = 'degraded'

        provider = app.config.get('AI_PROVIDER', 'mock')
        key_map = {
            'gemini': 'GEMINI_API_KEY', 'claude': 'ANTHROPIC_API_KEY',
            'openai': 'OPENAI_API_KEY', 'groq': 'GROQ_API_KEY'
        }
        if provider != 'mock':
            key = app.config.get(key_map.get(provider, ''), '')
            status['services']['ai'] = 'configured' if key else 'not_configured'
            status['services']['ai_provider'] = provider
        else:
            status['services']['ai'] = 'mock_mode'

        return jsonify(status)

    with app.app_context():
        db.create_all()
        from seeds import seed_database, seed_expanded_subjects
        seed_database()
        seed_expanded_subjects()

        # Validate AI provider on startup
        provider = app.config.get('AI_PROVIDER', 'mock')
        if provider != 'mock':
            key_map = {
                'gemini': 'GEMINI_API_KEY', 'claude': 'ANTHROPIC_API_KEY',
                'openai': 'OPENAI_API_KEY', 'groq': 'GROQ_API_KEY'
            }
            key_name = key_map.get(provider, '')
            key_value = app.config.get(key_name, '')
            if not key_value:
                app.logger.critical(f"AI_PROVIDER is '{provider}' but {key_name} is empty! AI features will fall back to mock.")
            else:
                app.logger.info(f"AI provider '{provider}' configured with {key_name}")

        # Cleanup expired blacklisted tokens
        try:
            from models.token_blacklist import TokenBlacklist
            cutoff = datetime.utcnow() - timedelta(days=7)
            expired = TokenBlacklist.query.filter(TokenBlacklist.expires_at < cutoff).delete()
            if expired:
                db.session.commit()
                app.logger.info(f"Cleaned up {expired} expired blacklisted tokens")
        except Exception as e:
            app.logger.warning(f"Token cleanup failed: {e}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
