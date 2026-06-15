from flask import Blueprint, jsonify, Response

config_bp = Blueprint('config', __name__)

@config_bp.route('/robots.txt')
def robots_txt():
    # A05: Security Misconfiguration - exposes sensitive paths
    content = """User-agent: *
Disallow: /debug
Disallow: /console
Disallow: /backup
Disallow: /internal
"""
    return Response(content, mimetype='text/plain')

@config_bp.route('/backup')
def backup():
    # A05: Exposed backup file with MD5 password hash
    content = """-- PixelMart Database Backup
-- Generated: 2024-01-15

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    role TEXT,
    balance REAL
);

INSERT INTO users VALUES (1, 'admin', '0192023a7bbd73250516f069df18b500', 'admin', 99999.0);
INSERT INTO users VALUES (2, 'flagadmin', 'flagadmin', 'user', 100.0);
INSERT INTO users VALUES (3, 'guest', 'guest123', 'user', 100.0);

-- Note: admin password hash is MD5('admin123')
-- Hash: 0192023a7bbd73250516f069df18b500
"""
    return Response(content, mimetype='text/plain')
