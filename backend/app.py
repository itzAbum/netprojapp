from flask import Flask, request, jsonify, session, render_template, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os
import secrets
import re
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, 
            static_folder='../frontend',
            static_url_path='',
            template_folder='../frontend')

# Security Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# CORS Configuration for local development
CORS(app, supports_credentials=True)

# Rate Limiting (Prevent Brute Force)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# MongoDB Connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['secure_todo_db']
users_collection = db['users']
tasks_collection = db['tasks']

# Input Sanitization
def sanitize_input(text):
    """Remove potentially dangerous characters to prevent XSS"""
    if not isinstance(text, str):
        return text
    # Remove HTML tags and potentially dangerous characters
    text = re.sub(r'<[^>]*>', '', text)
    text = re.sub(r'[<>"\']', '', text)
    return text.strip()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# CSRF Protection
def generate_csrf_token():
    """Generate CSRF token for session"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']

def validate_csrf_token(token):
    """Validate CSRF token"""
    return token == session.get('csrf_token')

# Authentication Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/styles.css')
def serve_css():
    """Serve CSS file"""
    return send_from_directory('../frontend', 'styles.css')

@app.route('/app.js')
def serve_js():
    """Serve JavaScript file"""
    return send_from_directory('../frontend', 'app.js')

@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Get CSRF token for forms"""
    return jsonify({'csrf_token': generate_csrf_token()})

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per hour")  # Limit registration attempts
def register():
    """User registration with input validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        email = sanitize_input(data.get('email', ''))
        password = data.get('password', '')
        name = sanitize_input(data.get('name', ''))
        
        if not email or not password or not name:
            return jsonify({'error': 'All fields are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Check if user exists
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password (protection against password leaks)
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        # Create user
        user = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'created_at': datetime.utcnow()
        }
        
        result = users_collection.insert_one(user)
        
        return jsonify({
            'message': 'Registration successful',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per hour")  # Brute force protection
def login():
    """User login with brute force protection"""
    try:
        data = request.get_json()
        
        email = sanitize_input(data.get('email', ''))
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create session
        session.permanent = True
        session['user_id'] = str(user['_id'])
        session['user_email'] = user['email']
        session['user_name'] = user['name']
        
        # Generate CSRF token
        generate_csrf_token()
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'name': user['name'],
                'email': user['email']
            },
            'csrf_token': session['csrf_token']
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    """User logout"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    """Get all tasks for current user"""
    try:
        user_id = session['user_id']
        tasks = list(tasks_collection.find({'user_id': user_id}))
        
        # Convert ObjectId to string
        for task in tasks:
            task['_id'] = str(task['_id'])
        
        return jsonify({'tasks': tasks}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch tasks'}), 500

@app.route('/api/tasks', methods=['POST'])
@login_required
@limiter.limit("30 per minute")
def create_task():
    """Create new task with CSRF protection"""
    try:
        data = request.get_json()
        
        # CSRF validation
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token or not validate_csrf_token(csrf_token):
            return jsonify({'error': 'Invalid CSRF token'}), 403
        
        # Sanitize input (XSS prevention)
        title = sanitize_input(data.get('title', ''))
        description = sanitize_input(data.get('description', ''))
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        # Create task
        task = {
            'user_id': session['user_id'],
            'title': title,
            'description': description,
            'completed': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = tasks_collection.insert_one(task)
        task['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Task created',
            'task': task
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to create task'}), 500

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@login_required
@limiter.limit("30 per minute")
def update_task(task_id):
    """Update task with CSRF protection"""
    try:
        # CSRF validation
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token or not validate_csrf_token(csrf_token):
            return jsonify({'error': 'Invalid CSRF token'}), 403
        
        data = request.get_json()
        user_id = session['user_id']
        
        # Validate ObjectId
        if not ObjectId.is_valid(task_id):
            return jsonify({'error': 'Invalid task ID'}), 400
        
        # Check task ownership
        task = tasks_collection.find_one({'_id': ObjectId(task_id), 'user_id': user_id})
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Sanitize input
        update_data = {}
        if 'title' in data:
            update_data['title'] = sanitize_input(data['title'])
        if 'description' in data:
            update_data['description'] = sanitize_input(data['description'])
        if 'completed' in data:
            update_data['completed'] = bool(data['completed'])
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update task
        tasks_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Task updated'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update task'}), 500

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@login_required
@limiter.limit("30 per minute")
def delete_task(task_id):
    """Delete task with CSRF protection"""
    try:
        # CSRF validation
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token or not validate_csrf_token(csrf_token):
            return jsonify({'error': 'Invalid CSRF token'}), 403
        
        user_id = session['user_id']
        
        # Validate ObjectId
        if not ObjectId.is_valid(task_id):
            return jsonify({'error': 'Invalid task ID'}), 400
        
        # Delete task (only if owned by user)
        result = tasks_collection.delete_one({
            '_id': ObjectId(task_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({'message': 'Task deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete task'}), 500

@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    """Get current user info"""
    return jsonify({
        'user': {
            'name': session.get('user_name'),
            'email': session.get('user_email')
        }
    }), 200

if __name__ == '__main__':
    # Development only - use gunicorn for production
    app.run(debug=True, host='0.0.0.0', port=5000)
