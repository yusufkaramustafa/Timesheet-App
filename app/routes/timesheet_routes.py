from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Timesheet, db
from datetime import datetime

bp = Blueprint('timesheet', __name__, url_prefix='/timesheet')

# Valid project options
PROJECT_OPTIONS = ['Firma A', 'Firma B', 'Firma C', 'Internal', 'Resmî Tatil', 'İzin']

@bp.route('/projects', methods=['GET'])
@jwt_required()
def get_project_options():
    return jsonify({"projects": PROJECT_OPTIONS})

@bp.route('/', methods=['POST'])
@jwt_required()
def create_timesheet():
    try:
        data = request.json
        user_id = get_jwt_identity()['id']
        
        # Validate project
        if data['project'] not in PROJECT_OPTIONS:
            return jsonify({"error": "Invalid project option"}), 400
        
        # Convert date string to date object
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        new_timesheet = Timesheet(
            user_id=user_id,
            date=date,
            project=data['project'],
            hours=float(data['hours']),
            description=data['description']
        )
        
        db.session.add(new_timesheet)
        db.session.commit()
        
        return jsonify({
            "message": "Timesheet created successfully",
            "timesheet": {
                "id": new_timesheet.id,
                "date": new_timesheet.date.strftime('%Y-%m-%d'),
                "project": new_timesheet.project,
                "hours": new_timesheet.hours,
                "description": new_timesheet.description,
                "created_at": new_timesheet.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@bp.route('/', methods=['GET'])
@jwt_required()
def get_timesheets():
    try:
        user_id = get_jwt_identity()['id']
        timesheets = Timesheet.query.filter_by(user_id=user_id).order_by(Timesheet.date.desc()).all()
        
        return jsonify({
            "timesheets": [{
                "id": ts.id,
                "date": ts.date.strftime('%Y-%m-%d'),
                "project": ts.project,
                "hours": ts.hours,
                "description": ts.description,
                "created_at": ts.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for ts in timesheets]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400 