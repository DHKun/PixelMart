from flask import Blueprint, jsonify

challenges_bp = Blueprint('challenges', __name__)

# All flags for verification
FLAGS = {
    'A01': 'FloatCTF{broken_access_control_bypassed}',
    'A02': 'FloatCTF{base64_is_not_encryption}',
    'A03': 'FloatCTF{sql_union_attack_master}',
    'A04': 'FloatCTF{negative_price_exploit}',
    'A05': 'FloatCTF{md5_cracked_admin_access}',
    'A06': 'FloatCTF{jquery_xss_feedback_flag}',
    'A07': 'FloatCTF{auth_bypass_with_space_username}',
    'A08': 'FloatCTF{csrf_get_request_password_change}',
    'A09': 'FloatCTF{log_exposure_admin_session}',
    'A10': 'FloatCTF{ssrf_caught_the_internal_flag}',
}

@challenges_bp.route('/challenges', methods=['GET'])
def get_challenges():
    return jsonify({
        'challenges': [
            {'id': 'A01', 'name': '越权访问', 'description': '找到管理后台的隐藏入口'},
            {'id': 'A02', 'name': '加密失效', 'description': '解码你的身份令牌'},
            {'id': 'A03', 'name': 'SQL注入', 'description': '发现隐藏的商品和秘密数据'},
            {'id': 'A04', 'name': '不安全设计', 'description': '利用负价格购买天价商品'},
            {'id': 'A05', 'name': '安全配置错误', 'description': '从备份文件破解管理员密码'},
            {'id': 'A06', 'name': '脆弱组件', 'description': '利用旧版 jQuery XSS 漏洞'},
            {'id': 'A07', 'name': '认证失效', 'description': '爆破或绕过登录限制'},
            {'id': 'A08', 'name': '完整性失效', 'description': '利用 GET 请求修改密码'},
            {'id': 'A09', 'name': '日志泄露', 'description': '从日志中窃取管理员会话'},
            {'id': 'A10', 'name': 'SSRF', 'description': '利用图片预览功能访问内部接口'},
        ]
    })

@challenges_bp.route('/verify-flag', methods=['POST'])
def verify_flag():
    from flask import request
    data = request.json
    flag = data.get('flag', '').strip()

    for challenge_id, correct_flag in FLAGS.items():
        if flag == correct_flag:
            return jsonify({
                'valid': True,
                'challenge_id': challenge_id,
                'message': f'🎉 恭喜！{challenge_id} 挑战完成！'
            })

    return jsonify({'valid': False, 'message': '❌ Flag 不正确，再试试！'})
