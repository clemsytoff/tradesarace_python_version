import json
import bcrypt
import mysql.connector
from flask import Blueprint, request, jsonify, session
from db import db, cursor

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "message": "Email and password are required"}), 400

    cursor.execute("SELECT id, name, email, password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"ok": False, "message": "Invalid email or password"}), 401

    pw_hash = user["password_hash"]
    if isinstance(pw_hash, str):
        pw_hash = pw_hash.encode("utf-8")
    if not bcrypt.checkpw(password.encode("utf-8"), pw_hash):
        return jsonify({"ok": False, "message": "Invalid email or password"}), 401

    session["user_id"] = int(user["id"])
    return jsonify({
        "ok": True,
        "message": "Login successful",
        "user": {"id": int(user["id"]), "name": user["name"], "email": user["email"]},
    })


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"ok": False, "message": "Name, email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"ok": False, "message": "Password must be at least 6 characters"}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
    wallet_json = json.dumps({"usdBalance": 20000, "btcBalance": 0.35, "bonus": 185})
    positions_json = json.dumps([])

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, wallet_json, positions_json) VALUES (%s, %s, %s, %s, %s)",
            (name, email, password_hash, wallet_json, positions_json),
        )
        db.commit()
    except mysql.connector.IntegrityError as e:
        if e.errno == 1062:
            return jsonify({"ok": False, "message": "An account with this email already exists"}), 409
        raise

    user_id = cursor.lastrowid
    return jsonify({
        "ok": True,
        "message": "Registration successful",
        "user": {"id": int(user_id), "name": name, "email": email},
    }), 201


@auth_bp.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"ok": False, "message": "Unauthorized"}), 401

    cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        session.clear()
        return jsonify({"ok": False, "message": "Unauthorized"}), 401

    return jsonify({"ok": True, "user": {"id": int(user["id"]), "name": user["name"], "email": user["email"]}})


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})
