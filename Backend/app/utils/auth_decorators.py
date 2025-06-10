from functools import wraps
from flask import request, jsonify
from app.models import User

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        try:
            token = token.split()[1]
            current_user = User.query.filter_by(token=token).first()
            if not current_user:
                return jsonify({"message": "User not found!"}), 404
        except Exception as e:
            return jsonify({"message": "Token is invalid!", "error": str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorator