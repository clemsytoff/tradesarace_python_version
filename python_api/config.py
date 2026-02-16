#leak pas ce fichier mec
import os


def get_env(key: str, default: str = None) -> str:
    value = os.environ.get(key, default)
    if value is None and default is None:
        raise ValueError(f"Variable d'environnement manquante: {key}")
    return value


MYSQL_HOST = get_env("MYSQL_HOST", "localhost")
MYSQL_PORT = int(get_env("MYSQL_PORT", "3306"))
MYSQL_USER = get_env("MYSQL_USER", "root")
MYSQL_PASSWORD = get_env("MYSQL_PASSWORD", "")
MYSQL_DATABASE = get_env("MYSQL_DATABASE", "tradesarace")

SECRET_KEY = get_env("SECRET_KEY", "change-le-en-prod-le-G")
