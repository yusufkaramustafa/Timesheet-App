from app import db
from datetime import datetime
from sqlalchemy.orm import validates

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Timesheet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    project = db.Column(db.String(20), nullable=False)  # ['Firma A', 'Firma B', 'Firma C', 'Internal', 'Resmî Tatil', 'İzin']
    hours = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add validation for hours
    @validates('hours')
    def validate_hours(self, key, value):
        if not isinstance(value, (int, float)):
            raise ValueError("Hours must be a number")
        if value < 1 or value > 8:
            raise ValueError("Hours must be between 1 and 8")
        return value

    # Relationship with User
    user = db.relationship('User', backref=db.backref('timesheets', lazy=True))