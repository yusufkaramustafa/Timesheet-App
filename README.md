# Timesheet Management Application

A modern, full-stack web application for managing employee timesheets, built with Flask and React. The application allows employees to log their work hours and administrators to manage users, view statistics, and generate reports.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yusufkaramustafa/Timesheet-App
cd Timesheet-App
```

2. Build and start the containers:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Local Development Setup

1. Set up the backend:
```bash
cd app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
