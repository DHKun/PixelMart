from flask import Blueprint, request, jsonify, make_response
from app import db
from app.models import Feedback

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    # A06: XSS vulnerable endpoint - admin will "view" this
    data = request.json
    message = data.get('message', '')

    if not message:
        return jsonify({'error': '消息不能为空'}), 400

    feedback = Feedback(message=message)
    db.session.add(feedback)
    db.session.commit()

    return jsonify({'message': '反馈已提交，管理员会尽快查看！'})

@feedback_bp.route('/admin/feedback', methods=['GET'])
def admin_view_feedback():
    # A06: Admin endpoint that "renders" feedback (simulated XSS)
    # The flag is set in admin's cookie when they view feedback
    feedbacks = Feedback.query.all()

    resp = make_response(jsonify({
        'feedbacks': [{'id': f.id, 'message': f.message, 'created_at': str(f.created_at)} for f in feedbacks],
        'note': '管理员正在查看反馈...'
    }))
    # A06: Flag in admin's cookie
    resp.set_cookie('flag', 'FloatCTF{jquery_xss_feedback_flag}', max_age=3600)
    return resp
