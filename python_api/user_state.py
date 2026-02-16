import json
from datetime import datetime
from flask import Blueprint, request, jsonify, session
from db import db, cursor

user_state_bp = Blueprint("user_state", __name__, url_prefix="/api/user-state")


def parse_json(val, default):
    if val is None:
        return default
    if isinstance(val, (dict, list)):
        return val
    try:
        return json.loads(val) if val else default
    except (json.JSONDecodeError, TypeError):
        return default


@user_state_bp.route("", methods=["GET"])
def get_user_state():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"ok": False, "message": "Unauthorized"}), 401

    cursor.execute("SELECT wallet_json, positions_json FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"ok": False, "message": "User not found"}), 404

    wallet = parse_json(user.get("wallet_json"), {"usdBalance": 20000, "btcBalance": 0.35, "bonus": 185})
    positions = parse_json(user.get("positions_json"), [])

    return jsonify({"ok": True, "wallet": wallet, "positions": positions})


@user_state_bp.route("", methods=["PUT"])
def put_user_state():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    wallet = data.get("wallet")
    positions = data.get("positions")

    if not wallet and not positions:
        return jsonify({"error": "Nothing to update"}), 400

    cursor.execute("SELECT wallet_json, positions_json FROM users WHERE id = %s", (user_id,))
    current = cursor.fetchone()
    if not current:
        return jsonify({"error": "User not found"}), 404

    new_wallet = parse_json(current.get("wallet_json"), {"usdBalance": 20000, "btcBalance": 0.35, "bonus": 185})
    new_positions = parse_json(current.get("positions_json"), [])

    if wallet:
        if not isinstance(wallet, dict) or not all(k in wallet for k in ("usdBalance", "btcBalance", "bonus")):
            return jsonify({"ok": False, "message": "Invalid wallet"}), 400
        new_wallet = wallet

    if positions:
        valid = []
        for p in (positions if isinstance(positions, list) else []):
            if isinstance(p, dict) and p.get("side") in ("buy", "sell"):
                pp = dict(p)
                pp.setdefault("placedAt", datetime.utcnow().isoformat() + "Z")
                valid.append(pp)
        new_positions = valid

    cursor.execute(
        "UPDATE users SET wallet_json = %s, positions_json = %s WHERE id = %s",
        (json.dumps(new_wallet), json.dumps(new_positions), user_id),
    )
    db.commit()

    return jsonify({"ok": True, "wallet": new_wallet, "positions": new_positions})
