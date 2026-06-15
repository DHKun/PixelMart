from flask import Blueprint, request, jsonify
from app import db
from app.models import User
import base64, json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin', methods=['GET'])
def admin_panel():
    # A01: Broken Access Control
    # Check X-Forwarded-Role header OR cookie role
    x_role = request.headers.get('X-Forwarded-Role', '')
    cookie_role = request.cookies.get('role', 'user')

    # Check if actually logged in as admin via token
    token = request.cookies.get('token', '')
    is_authenticated_admin = False
    try:
        decoded = base64.b64decode(token).decode()
        token_data = json.loads(decoded)
        if token_data.get('role') == 'admin':
            is_authenticated_admin = True
    except:
        pass

    # A08: Flag for CSRF exploit - actually logged in as admin
    if is_authenticated_admin:
        return jsonify({
            'message': '欢迎管理员！您通过合法身份登录。',
            'flag': 'FloatCTF{csrf_get_request_password_change}',
            'users_count': User.query.count(),
            'admin_panel': True,
            'authenticated': True
        })

    # A01: Flag for broken access control - bypassed auth
    if x_role == 'admin' or cookie_role == 'admin':
        return jsonify({
            'message': '欢迎管理员！您通过越权方式访问。',
            'flag': 'FloatCTF{broken_access_control_bypassed}',
            'users_count': User.query.count(),
            'admin_panel': True,
            'authenticated': False
        })

    return jsonify({'error': '未授权访问'}), 403
