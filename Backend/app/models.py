from . import db
import secrets
from datetime import datetime, timezone

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(32), unique=True, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)

    def generate_token(self):
        self.token = secrets.token_hex(16)
        db.session.commit()

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    court_number = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class CourtRating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    court_number = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    review = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))