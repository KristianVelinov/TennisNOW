from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    load_dotenv()

    database_url = os.getenv("DATABASE_URL")
    
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    migrate = Migrate(app, db)

    from .reservations import reservations_bp
    from .account_management import users_bp
    from app.profilestats import profile_bp
    from app.ratings import ratings_bp

    app.register_blueprint(reservations_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(ratings_bp, url_prefix="/ratings")

    with app.app_context():
        from . import models

    return app
