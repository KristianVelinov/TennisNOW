from flask import Blueprint, request, jsonify
from . import db
from .models import User

users_bp = Blueprint('users', __name__, url_prefix='')

@users_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken."}), 409

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created.", "id": new_user.id}), 201


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username, password=password).first()

    if not user:
        return jsonify({"message": "Invalid username or password."}), 401

    return jsonify({"message": "Login successful.", "id": user.id}), 200