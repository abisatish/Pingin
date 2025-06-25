# apps/backend/app/core/auth.py
from passlib.context import CryptContext
from jose import jwt
from datetime import timedelta, datetime

# --- CONFIG ---
PWD_CXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = "super-secret"     # Ideally load from env for production
ALGO = "HS256"
ACCESS_TTL = timedelta(hours=4)

# --- PASSWORD UTILS ---
def verify(password: str, hash_: str) -> bool:
    return PWD_CXT.verify(password, hash_)

def hash_pwd(password: str) -> str:
    return PWD_CXT.hash(password)

# --- TOKEN UTILS ---
def create_token(data: dict) -> str:
    # Ensure sub is a string as required by JWT spec
    if "sub" in data:
        data["sub"] = str(data["sub"])

    to_encode = data | {"exp": datetime.utcnow() + ACCESS_TTL}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGO)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGO])
