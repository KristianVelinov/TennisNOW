from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from .reservations import reservations_bp
    from .account_management import users_bp

    app.register_blueprint(reservations_bp)
    app.register_blueprint(users_bp)

    with app.app_context():
        from . import models
        db.create_all()

    return app