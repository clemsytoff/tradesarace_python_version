"""faut lancer ce fichier"""
from flask import Flask
from flask_cors import CORS

from config import SECRET_KEY
from auth import auth_bp
from leaderboard import leaderboard_bp
from user_state import user_state_bp

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Avec le proxy Next.js, les requêtes arrivent en same-origin → cookies OK par défaut
CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(leaderboard_bp)
app.register_blueprint(user_state_bp)


@app.route("/")
def index():
    return {"ok": True, "message": "Clément t'es le goat merci pour cette API boostée"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True) #oublie pas de passer en false en prod le G
