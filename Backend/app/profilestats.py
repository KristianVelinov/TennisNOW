from flask import Blueprint, jsonify
from datetime import datetime
from app import db
from app.models import Reservation, CourtRating
from app.utils.auth_decorators import token_required

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/stats", methods=["GET"])
@token_required
def get_profile_stats(current_user):
    total_reservations = Reservation.query.filter_by(user_id=current_user.id).count()
    total_reviews = CourtRating.query.filter_by(user_id=current_user.id).count()
    avg_rating = db.session.query(db.func.avg(CourtRating.rating))\
        .filter(CourtRating.user_id == current_user.id).scalar()

    upcoming_reservation = Reservation.query.filter(
        Reservation.user_id == current_user.id,
        Reservation.start_time > datetime.now()
    ).order_by(Reservation.start_time.asc()).first()

    return jsonify({
        "total_reservations": total_reservations,
        "total_reviews": total_reviews,
        "average_rating": round(avg_rating, 2) if avg_rating else None,
        "next_reservation": {
            "court_number": upcoming_reservation.court_number,
            "start_time": upcoming_reservation.start_time.isoformat(),
            "end_time": upcoming_reservation.end_time.isoformat()
        } if upcoming_reservation else None
    }), 200