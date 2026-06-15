from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import hashlib

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Stored in plaintext! (A02)
    role = db.Column(db.String(20), default='user')  # A01: role in cookie
    balance = db.Column(db.Float, default=100.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    is_hidden = db.Column(db.Boolean, default=False)  # A03: hidden products

class ThisIsFlag(db.Model):
    """A03: Hidden table for SQL injection UNION attack"""
    __tablename__ = 'this_is_flag'
    id = db.Column(db.Integer, primary_key=True)
    flag = db.Column(db.String(200), nullable=False)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    note = db.Column(db.Text, nullable=True)  # A07: flag in admin's order note
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_db():
    db.create_all()

    # Only seed if empty
    if User.query.count() == 0:
        # Create admin user with MD5 hash (A05)
        admin = User(
            username='admin',
            password=hashlib.md5('admin123'.encode()).hexdigest(),  # A05: MD5 hash
            role='admin',
            balance=99999.0
        )
        db.session.add(admin)

        # Create flagadmin user with weak password (A07)
        flagadmin = User(
            username='flagadmin',
            password='flagadmin',  # Plaintext weak password
            role='user',
            balance=100.0
        )
        db.session.add(flagadmin)

        # Create regular user
        guest = User(
            username='guest',
            password='guest123',
            role='user',
            balance=100.0
        )
        db.session.add(guest)

        # Create products
        products_data = [
            Product(name='像素宝剑', description='一把闪闪发光的像素宝剑', price=299.0, is_hidden=False),
            Product(name='魔法药水', description='恢复 50 HP 的魔法药水', price=50.0, is_hidden=False),
            Product(name='神秘地图', description='通往宝藏的神秘地图', price=150.0, is_hidden=False),
            Product(name='水晶头骨', description='散发着神秘光芒的水晶头骨', price=999.0, is_hidden=False),
            Product(name='龙鳞盾牌', description='龙鳞制成的坚固盾牌', price=599.0, is_hidden=False),
            Product(name='???', description='FloatCTF{sql_injection_found_the_hidden_table}', price=99999.0, is_hidden=True),
            Product(name='🏁 FLAG', description='购买我就能获得 flag！', price=99999.0, is_hidden=False),
        ]
        for p in products_data:
            db.session.add(p)

        # Create this_is_flag table data (A03)
        flag_entry = ThisIsFlag(flag='FloatCTF{sql_union_attack_master}')
        db.session.add(flag_entry)

        # Create admin order with flag in note (A07)
        admin_order = Order(
            user_id=1,  # admin
            product_id=1,
            price=299.0,
            quantity=1,
            note='FloatCTF{auth_bypass_with_space_username}'
        )
        db.session.add(admin_order)

        db.session.commit()
