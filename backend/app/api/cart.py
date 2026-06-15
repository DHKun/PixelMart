from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Product, Order

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/checkout', methods=['POST'])
def checkout():
    # A04: Insecure Design - client sends price
    data = request.json
    items = data.get('items', [])

    # Get user from token
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
    except:
        return jsonify({'error': '无效的 token'}), 401

    total = 0
    for item in items:
        # A04: No server-side price validation!
        total += item['price'] * item['quantity']

    # A04: Should subtract from balance, but client controls price!
    # Negative price → total is negative → balance INCREASES
    new_balance = user.balance - total  # Subtract total (negative = balance goes up)

    # Check if user bought the FLAG product
    bought_flag = False
    for item in items:
        product = Product.query.get(item['id'])
        if product and 'FLAG' in product.name:
            bought_flag = True

    response = {
        'message': '结算成功！',
        'total': total,
        'new_balance': new_balance,
    }

    # A04: Flag if user bought FLAG (balance before purchase >= 99999)
    # User must first exploit negative prices to increase balance,
    # then buy FLAG in a separate request
    if bought_flag and user.balance >= 99999:
        response['flag'] = 'FloatCTF{negative_price_exploit}'
        response['message'] = '🎉 你购买了 FLAG 商品！flag: FloatCTF{negative_price_exploit}'

    user.balance = new_balance
    db.session.commit()
    return jsonify(response)
