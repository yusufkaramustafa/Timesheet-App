from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Enable CORS for all routes with more permissive settings for development
    CORS(app, 
         resources={r"/*": {
             "origins": ["http://127.0.0.1:5173", "http://localhost:5173"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"]
         }})

    db.init_app(app)
    jwt.init_app(app)
    
    from app.routes import auth_routes, employee_routes, admin_routes, timesheet_routes
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(employee_routes.bp)
    app.register_blueprint(admin_routes.bp)
    app.register_blueprint(timesheet_routes.bp)
    
    return app