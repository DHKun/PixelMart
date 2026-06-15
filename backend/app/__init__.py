from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    app.config['SECRET_KEY'] = 'pixelmart-super-secret-key-2024'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pixelmart.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.products import products_bp
    from app.api.admin import admin_bp
    from app.api.challenges import challenges_bp
    from app.api.cart import cart_bp
    from app.api.ssrf import ssrf_bp
    from app.api.feedback import feedback_bp
    from app.api.logs import logs_bp
    from app.api.profile import profile_bp
    from app.api.config import config_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(products_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(challenges_bp, url_prefix='/api')
    app.register_blueprint(cart_bp, url_prefix='/api')
    app.register_blueprint(ssrf_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(logs_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/api')
    app.register_blueprint(config_bp)

    # Internal flag endpoint (for SSRF)
    @app.route('/internal/flag')
    def internal_flag():
        return {'flag': 'FloatCTF{ssrf_caught_the_internal_flag}'}

    with app.app_context():
        from app import models
        models.init_db()

    return app
