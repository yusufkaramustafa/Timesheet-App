from flask import Blueprint, jsonify, send_file, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import Timesheet, User, db
import pandas as pd
from io import BytesIO
import zipfile
from datetime import datetime

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
    return jsonify([{
        'id': t.id,
        'user_id': t.user_id,
        'date': t.date.strftime('%Y-%m-%d'),
        'project': t.project,
        'hours': t.hours,
        'description': t.description,
        'created_at': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for t in timesheets])

@bp.route('/export/timesheet', methods=['GET'])
@jwt_required()
def export_timesheet():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        # Get query parameters
        selected_user_id = request.args.get('user_id')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        export_all = request.args.get('export_all') == 'true'

        if export_all:
            # Create a ZIP file containing Excel files for all users
            memory_file = BytesIO()
            with zipfile.ZipFile(memory_file, 'w') as zf:
                users = User.query.all()
                for user in users:
                    excel_data = create_user_timesheet_excel(user.id, date_from, date_to)
                    zf.writestr(f'timesheet_{user.username}.xlsx', excel_data.getvalue())
            
            memory_file.seek(0)
            return send_file(
                memory_file,
                mimetype='application/zip',
                as_attachment=True,
                download_name=f'all_timesheets_{datetime.now().strftime("%Y%m%d")}.zip'
            )
        else:
            # Export single user's timesheet
            if not selected_user_id:
                return jsonify({"error": "User ID is required"}), 400
            
            excel_data = create_user_timesheet_excel(selected_user_id, date_from, date_to)
            user = User.query.get(selected_user_id)
            
            return send_file(
                excel_data,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=f'timesheet_{user.username}_{datetime.now().strftime("%Y%m%d")}.xlsx'
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_user_timesheet_excel(user_id, date_from=None, date_to=None):
    # Query timesheets
    query = Timesheet.query.filter_by(user_id=user_id)
    if date_from:
        query = query.filter(Timesheet.date >= date_from)
    if date_to:
        query = query.filter(Timesheet.date <= date_to)
    timesheets = query.order_by(Timesheet.date).all()
    
    # Create DataFrame
    data = [{
        'Date': ts.date.strftime('%Y-%m-%d'),
        'Project': ts.project,
        'Hours': ts.hours,
        'Description': ts.description,
        'Created At': ts.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for ts in timesheets]
    
    df = pd.DataFrame(data)
    
    # Add summary at the bottom
    summary = pd.DataFrame([{
        'Project': 'Total Hours',
        'Hours': df['Hours'].sum()
    }])
    
    # Create Excel file in memory
    excel_buffer = BytesIO()
    with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Timesheets', index=False)
        summary.to_excel(writer, sheet_name='Summary', index=False)
        
        # Auto-adjust columns width
        for sheet in writer.sheets.values():
            for column in sheet.columns:
                max_length = 0
                column = [cell for cell in column]
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(cell.value)
                    except:
                        pass
                adjusted_width = (max_length + 2)
                sheet.column_dimensions[column[0].column_letter].width = adjusted_width
    
    excel_buffer.seek(0)
    return excel_buffer