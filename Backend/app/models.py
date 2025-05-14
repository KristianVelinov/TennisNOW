from . import db
import secrets

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(32), unique=True)

    def generate_token(self):
        self.token = secrets.token_hex(16)
        db.session.commit()

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    court_number = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)