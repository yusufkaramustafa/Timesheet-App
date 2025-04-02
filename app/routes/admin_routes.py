from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import Timesheet, User, db

bp = Blueprint('admin', __name__, url_prefix='/admin')

@bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username, "role": u.role} for u in users])

@bp.route('/timesheets', methods=['GET'])
@jwt_required()
def get_all_timesheets():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    timesheets = Timesheet.query.all()
    return jsonify([t.to_dict() for t in timesheets])