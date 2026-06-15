from flask import Blueprint, request, jsonify
from app import db
from app.models import User

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile/change-password', methods=['GET'])
def change_password():
    # A08: CSRF - password change via GET request (should be POST)
    username = request.args.get('username', '')
    new_password = request.args.get('new_password', '')

    if not username or not new_password:
        return jsonify({'error': '参数不完整'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': '用户不存在'}), 404

    user.password = new_password
    db.session.commit()

    return jsonify({'message': f'密码修改成功！{username} 的新密码是: {new_password}'})

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': '未登录'}), 401

    import base64, json
    try:
        decoded = base64.b64decode(token).decode()
        token_data = json.loads(decoded)
        user = User.query.get(token_data['user_id'])
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
