from flask import Blueprint, request, jsonify, make_response
from app import db
from app.models import User
import base64
import json
import hashlib

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    # A07: Username not trimmed - can register 'admin ' (with space)
    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({'error': '用户名已存在'}), 400

    user = User(
        username=username,
        password=password,  # A02: Plaintext storage
        role='user',
        balance=100.0
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': '注册成功'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')

    # A07: No rate limiting - brute force possible
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': '用户名或密码错误'}), 401

    # A02: Plaintext password comparison
    if user.password != password:
        # Also check MD5 (for admin login via A05)
        if hashlib.md5(password.encode()).hexdigest() != user.password:
            return jsonify({'error': '用户名或密码错误'}), 401

    # A02: Base64 encoded token with flag inside
    token_data = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role
    }

    # If this is the guest user, include the A02 flag in token
    if user.username == 'guest':
        token_data['flag'] = 'FloatCTF{base64_is_not_encryption}'

    token = base64.b64encode(json.dumps(token_data).encode()).decode()

    response_data = {
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'balance': user.balance
        }
    }

    # A05: If admin logs in (via cracked MD5 from backup), give the A05 flag
    if user.username == 'admin':
        response_data['flag'] = 'FloatCTF{md5_cracked_admin_access}'

    # A07: If flagadmin logs in with weak password, give the A07 flag
    if user.username == 'flagadmin':
        response_data['flag'] = 'FloatCTF{auth_bypass_with_space_username}'

    resp = make_response(jsonify(response_data))
    resp.set_cookie('token', token, max_age=3600)
    resp.set_cookie('role', user.role, max_age=3600)  # A01: Role in cookie
    return resp

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': '未登录'}), 401

    try:
        decoded = base64.b64decode(token).decode()
        data = json.loads(decoded)
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': '用户不存在'}), 401
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'balance': user.balance
        })
    except:
        return jsonify({'error': '无效的 token'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({'message': '已退出登录'}))
    resp.set_cookie('token', '', max_age=0)
    resp.set_cookie('role', '', max_age=0)
    return resp
