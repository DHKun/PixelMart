from flask import Blueprint, jsonify

logs_bp = Blueprint('logs', __name__)

# A09: Simulated log file with sensitive data
SIMULATED_LOGS = """
[2024-01-15 08:00:01] 系统启动完成
[2024-01-15 08:00:05] 管理员 admin 登录成功 (session: admin_session_token_12345)
[2024-01-15 08:00:10] 管理员 admin 访问管理面板
[2024-01-15 08:01:00] 用户 guest 注册成功
[2024-01-15 08:01:30] 用户 guest 登录成功
[2024-01-15 08:02:00] 管理员 admin 修改了系统配置
[2024-01-15 08:02:15] 管理员 admin 查看了 flag: FloatCTF{log_exposure_admin_session}
[2024-01-15 08:03:00] 用户 guest 浏览商品列表
[2024-01-15 08:04:00] 系统运行正常
"""

@logs_bp.route('/logs', methods=['GET'])
def get_logs():
    # A09: Unauthenticated log access
    return jsonify({
        'logs': SIMULATED_LOGS,
        'note': '系统运行日志'
    })

@logs_bp.route('/admin/logs-session', methods=['GET'])
def admin_logs_session():
    # Simulated endpoint that accepts the leaked session token
    return jsonify({
        'message': '管理员会话验证成功！',
        'flag': 'FloatCTF{log_exposure_admin_session}'
    })
