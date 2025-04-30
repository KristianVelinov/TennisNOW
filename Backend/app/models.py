from . import db

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    court_number = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)