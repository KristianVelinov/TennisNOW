from flask import Blueprint, request, jsonify
from datetime import datetime
from . import db
from .models import Reservation, User
from app.utils.auth_decorators import token_required

reservations_bp = Blueprint('reservations', __name__, url_prefix='/reservations')

@reservations_bp.route('/myreservations', methods=['GET'])
@token_required
def get_reservations(current_user):
    if current_user.is_admin:
        reservations = Reservation.query.all()
    else:
        reservations = Reservation.query.filter_by(user_id=current_user.id).all()

    result = [{
        "id": r.id,
        "court_number": r.court_number,
        "start_time": r.start_time.isoformat(),
        "end_time": r.end_time.isoformat()
    } for r in reservations]

    return jsonify(result), 200




@reservations_bp.route("/court/<int:court_number>/<string:date>", methods=["GET"])
def get_specific_reservation(court_number, date): # will be used by frontend to filter reservation booking (once i make the frontend(which might never even materialize))
                                                  # WOOOOOOW!!! I actually made the frontend! Former me would be proud of future me using this!
    try:
        day_start = datetime.fromisoformat(date + "T00:00:00")
        day_end = datetime.fromisoformat(date + "T23:59:59")

        reservations = Reservation.query.filter(
            Reservation.court_number == court_number,
            Reservation.start_time >= day_start,
            Reservation.start_time <= day_end
        ).all()

        result = [{
            "id": reservation.id,
            "start_time": reservation.start_time.isoformat(),
            "end_time": reservation.end_time.isoformat(),
            "user_id": reservation.user_id
        } for reservation in reservations]

        return jsonify(result), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 400

@reservations_bp.route("/book", methods=["POST"])
@token_required
def create_reservation(current_user):
    data = request.get_json()
    try:
        court_number = data["court_number"]
        start_time = datetime.fromisoformat(data["start_time"])
        end_time = datetime.fromisoformat(data["end_time"])

        conflicting_reservations = Reservation.query.filter(
            Reservation.court_number == court_number,
            Reservation.start_time < end_time,
            Reservation.end_time > start_time
        ).all()

        if conflicting_reservations:
            return jsonify({"message": "Time slot conflicts with an existing reservation."}), 409
        
        existing_reservations = Reservation.query.filter(
            Reservation.user_id == current_user.id,
            Reservation.start_time < end_time,
            Reservation.end_time > start_time
        ).all()

        if existing_reservations:
            return jsonify({"message": "You already have a conflicting reservation."}), 409

        new_reservation = Reservation(
            user_id=current_user.id,
            court_number=court_number,
            start_time=start_time,
            end_time=end_time
        )
        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({
            "id": new_reservation.id,
            "court_number": new_reservation.court_number,
            "start_time": new_reservation.start_time.isoformat(),
            "end_time": new_reservation.end_time.isoformat(),
            "user_id": new_reservation.user_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@reservations_bp.route("/delete/<int:reservation_id>", methods=["DELETE"])
@token_required
def delete_reservation(current_user, reservation_id):
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404

    if reservation.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Unauthorized"}), 403

    time_now = datetime.now()
    if ((reservation.start_time - time_now).total_seconds() < 60*60*2 and
        (reservation.end_time - time_now).total_seconds() > 0 and
        not current_user.is_admin):
        return jsonify({"message": "Cannot delete reservation less than 2 hours before start time"}), 403

    db.session.delete(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation deleted"}), 200

@reservations_bp.route("/update/<int:reservation_id>", methods=["PATCH"])
@token_required
def update_reservation(current_user, reservation_id):
    data = request.get_json()
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404

    if reservation.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "You don't have permission to update this reservation."}), 403

    time_now = datetime.now()
    if reservation.start_time < time_now:
        return jsonify({"message": "Cannot modify a past reservation."}), 403

    if (reservation.start_time - time_now).total_seconds() < 60*60*2 and not current_user.is_admin:
        return jsonify({"message": "Cannot modify reservation less than 2 hours before start time"}), 403

    new_court_number = data.get("court_number", reservation.court_number)
    new_start_time = datetime.fromisoformat(data.get("start_time")) if "start_time" in data else reservation.start_time
    new_end_time = datetime.fromisoformat(data.get("end_time")) if "end_time" in data else reservation.end_time

    conflicting_reservations = Reservation.query.filter( #this is to avoid conflicting times on the same court
        Reservation.id != reservation.id,
        Reservation.court_number == new_court_number,
        Reservation.start_time < new_end_time,
        Reservation.end_time > new_start_time
    ).all()

    if conflicting_reservations:
        return jsonify({"message": "Time slot conflicts with an existing reservation."}), 409

    reservation.court_number = new_court_number
    reservation.start_time = new_start_time
    reservation.end_time = new_end_time
    db.session.commit()

    return jsonify({
        "id": reservation.id,
        "court_number": reservation.court_number,
        "start_time": reservation.start_time.isoformat(),
        "end_time": reservation.end_time.isoformat()
    }), 200