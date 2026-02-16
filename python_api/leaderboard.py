import json
from flask import Blueprint, request, jsonify
from db import cursor

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")


@leaderboard_bp.route("", methods=["GET"])
def get_leaderboard():
    limit_param = request.args.get("limit", type=int)
    limit = 10
    if limit_param and limit_param > 0:
        limit = min(limit_param, 25)

    cursor.execute("SELECT id, name, email, wallet_json FROM users")
    rows = cursor.fetchall()

    sorted_rows = []
    for row in rows:
        wallet = row.get("wallet_json")
        if isinstance(wallet, str):
            try:
                wallet = json.loads(wallet) if wallet else {}
            except (json.JSONDecodeError, TypeError):
                wallet = {}
        elif not isinstance(wallet, dict):
            wallet = {}
        val = wallet.get("usdBalance", 0)
        usd_balance = val if isinstance(val, (int, float)) else 0
        sorted_rows.append({"id": row["id"], "name": row["name"], "usdBalance": usd_balance})

    sorted_rows.sort(key=lambda x: x["usdBalance"], reverse=True)

    leaderboard = []
    for i, row in enumerate(sorted_rows[:limit]):
        leaderboard.append({
            "rank": i + 1,
            "id": row["id"],
            "name": row["name"],
            "usdBalance": row["usdBalance"],
        })

    return jsonify({"ok": True, "leaderboard": leaderboard})
