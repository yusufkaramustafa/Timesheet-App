from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Timesheet, db

bp = Blueprint('employee', __name__, url_prefix='/employee')

@bp.route('/timesheet', methods=['POST'])
@jwt_required()
def add_timesheet():
    user_id = get_jwt_identity()
    data = request.json
    new_timesheet = Timesheet(
        user_id=user_id,
        project=data['project'],
        hours=data['hours'],
        description=data.get('description', ''),
        date=data['date']
    )
    db.session.add(new_timesheet)
    db.session.commit()
    return jsonify({"message": "Timesheet added successfully!"}), 201

@bp.route('/timesheet', methods=['GET'])
@jwt_required()
def get_timesheets():
    user_id = get_jwt_identity()
    timesheets = Timesheet.query.filter_by(user_id=user_id).all()
    return jsonify([t.to_dict() for t in timesheets])