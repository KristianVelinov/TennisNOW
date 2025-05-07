from flask import Blueprint, request, jsonify
from datetime import datetime
from . import db
from .models import Reservation

reservations_bp = Blueprint('reservations', __name__, url_prefix='/reservations')

@reservations_bp.route("/booked", methods=["GET"])
def get_reservations():
    reservations = Reservation.query.all()
    result = []
    for reservation in reservations:
        result.append({
            "id": reservation.id,
            "court_number": reservation.court_number,
            "start_time": reservation.start_time.isoformat(),
            "end_time": reservation.end_time.isoformat()
        })
    return jsonify(result), 200

@reservations_bp.route("/court/<int:court_number>/<string:date>", methods=["GET"])
def get_specific_reservation(court_number, date): # will be used by frontend to filter reservation booking (once i make the frontend(which might never even materialize))
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
            "end_time": reservation.end_time.isoformat()
        } for reservation in reservations]

        return jsonify(result), 200

    except Exception as error:
        return jsonify({"error": str(error)}), 400

@reservations_bp.route("/book", methods=["POST"])
def create_reservation():
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

        new_reservation = Reservation(
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
            "end_time": new_reservation.end_time.isoformat()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@reservations_bp.route("/delete/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404
    
    time_now = datetime.now()
    if (((reservation.start_time - time_now).total_seconds() < 60*60*2) and (reservation.end_time - time_now).total_seconds() > 0):
        return jsonify({"message": "Cannot delete reservation less than 2 hours before start time"}), 403
    
    db.session.delete(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation deleted"}), 200

@reservations_bp.route("/update/<int:reservation_id>", methods=["PATCH"])
def update_reservation(reservation_id):
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404

    time_now = datetime.now()
    if (reservation.start_time - time_now).total_seconds() < 60 * 60 * 2:
        return jsonify({"message": "Cannot modify reservation less than 2 hours before start time"}), 403

    data = request.get_json()

    try:
        new_court_number = reservation.court_number
        new_start_time = reservation.start_time
        new_end_time = reservation.end_time

        if "court_number" in data:
            new_court_number = data["court_number"]
        if "start_time" in data:
            new_start_time = datetime.fromisoformat(data["start_time"])
        if "end_time" in data:
            new_end_time = datetime.fromisoformat(data["end_time"])

        conflicting_reservations = Reservation.query.filter(
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

    except Exception as error:
        return jsonify({"error": str(error)}), 400
