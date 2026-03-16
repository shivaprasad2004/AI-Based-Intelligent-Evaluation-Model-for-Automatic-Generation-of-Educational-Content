import os
import logging
from logging.handlers import RotatingFileHandler


def setup_logger(app):
    """Configure application-wide logging with file and console handlers."""
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)

    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )

    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'evalai.log'),
        maxBytes=10_000_000,
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)

    app.logger.addHandler(file_handler)
    app.logger.setLevel(log_level)

    return app.logger
