from flask import Blueprint, request, jsonify, Response
import requests as http_requests

ssrf_bp = Blueprint('ssrf', __name__)

@ssrf_bp.route('/fetch-image', methods=['POST'])
def fetch_image():
    # A10: SSRF - no URL validation
    data = request.json
    url = data.get('url', '')

    if not url:
        return jsonify({'error': 'URL 不能为空'}), 400

    try:
        # A10: Directly fetch whatever URL is provided
        resp = http_requests.get(url, timeout=5)
        return Response(resp.content, content_type=resp.headers.get('content-type', 'text/plain'))
    except Exception as e:
        return jsonify({'error': f'获取图片失败: {str(e)}'}), 400
