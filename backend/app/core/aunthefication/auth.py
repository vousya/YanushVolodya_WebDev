from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.database import postgres_database
from sqlalchemy import select
from app.core.models import Login
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends, status
import hmac
import hashlib


load_dotenv(dotenv_path="app/core/.env")
secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise ValueError("SECRET_KEY is not found in the .env file.")

ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def hash_password(password: str) -> str:
    return hmac.new(
        key=secret_key.encode(),
        msg=password.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)

async def authenticate_user(email: str, password: str):
    async for session in postgres_database.get_session():
        result = await session.execute(select(Login).where(Login.email == email))
        user = result.scalar_one_or_none()
        if user and verify_password(plain_password=password, hashed_password=user.password):
            return True
    return False

def get_email(token):
    payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    return email

async def validate_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        email: str = get_email(token)
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception