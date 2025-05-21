from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models import Reservation, CourtRating
from app.utils.auth_decorators import token_required

ratings_bp = Blueprint("ratings", __name__)

@ratings_bp.route("/rate/<int:reservation_id>", methods=["POST"])
@token_required
def rate_reservation(current_user, reservation_id):
    data = request.get_json()

    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found."}), 404

    if reservation.user_id != current_user.id:
        return jsonify({"message": "You don't own this reservation."}), 403

    if reservation.end_time > datetime.now():
        return jsonify({"message": "Cannot rate before reservation ends."}), 403

    if not (1 <= data.get("rating", 0) <= 5):
        return jsonify({"message": "Rating must be between 1 and 5."}), 400

    rating = CourtRating(
        court_number=reservation.court_number,
        reservation_id=reservation.id,
        user_id=current_user.id,
        rating=data["rating"],
        review=data.get("review", "")
    )
    db.session.add(rating)
    db.session.commit()

    return jsonify({"message": "Rating submitted."}), 201

@ratings_bp.route("/court/<int:court_number>/ratings", methods=["GET"])
def get_court_ratings(court_number):
    ratings = CourtRating.query.filter_by(court_number=court_number).all()

    if not ratings:
        return jsonify({"message": "No ratings found for this court."}), 404

    result = [{
        "rating": r.rating,
        "review": r.review,
        "user_id": r.user_id,
        "created_at": r.created_at.isoformat()
    } for r in ratings]

    avg_rating = sum(r.rating for r in ratings) / len(ratings)

    return jsonify({
        "average_rating": round(avg_rating, 2),
        "ratings": result
    }), 200