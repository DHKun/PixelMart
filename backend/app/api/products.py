from flask import Blueprint, request, jsonify
from sqlalchemy import text
from app import db
from app.models import Product, ThisIsFlag

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    search = request.args.get('search', '')

    if search:
        # A03: SQL Injection vulnerable search
        # Direct string interpolation into query
        query = text(f"SELECT * FROM products WHERE name LIKE '%{search}%' OR description LIKE '%{search}%'")
        result = db.session.execute(query)
        products = result.fetchall()
        return jsonify([{
            'id': p[0],
            'name': p[1],
            'description': p[2],
            'price': p[3],
            'is_hidden': p[4]
        } for p in products])
    else:
        # Normal query: only show non-hidden products
        products = Product.query.filter_by(is_hidden=False).all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'is_hidden': p.is_hidden
        } for p in products])

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': '商品不存在'}), 404
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'is_hidden': product.is_hidden
    })
