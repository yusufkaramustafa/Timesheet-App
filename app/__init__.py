from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    db.init_app(app)
    jwt.init_app(app)
    
    from app.routes import auth_routes, employee_routes, admin_routes
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(employee_routes.bp)
    app.register_blueprint(admin_routes.bp)
    
    return app