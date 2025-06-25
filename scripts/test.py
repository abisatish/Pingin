from jose import jwt, JWTError

JWT_SECRET = "super-secret"
ALGO = "HS256"

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoxNzUwODE3MTQ0fQ.Qskn1cqlMCvLwdz2rRRpvGxRAT7_RZofaEVb_QAu6yA"

try:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGO])
    print("✅ Token valid, payload:", payload)
except JWTError as e:
    print("❌ Token invalid:", e)