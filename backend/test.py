import asyncio

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from app.core.models import Login, Student
from app.core.database import postgres_database
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

def generate_corporate_post(name: str, group: str) -> str:
    name = name.lower().replace(" ", ".")
    group = group.lower().replace("-", "")
    return f"{name}.{group}@lpnu.ua"

async def seed_corporate_accounts():
    async for session in postgres_database.get_session():
        result = await session.execute(select(Student))
        students = result.scalars().all()
        for s in students:
            post = generate_corporate_post(s.name, s.group_name)
            birthday = str(s.birthday)   # TODO hashing

            # Check if already exists
            stmt = select(Login).where(
                (Login.student_id == s.student_id) | (Login.email == post)
            )
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()

            if not existing:
                new_account = Login(
                    student_id=s.student_id,
                    email=post,
                    password=birthday
                )
                session.add(new_account)

        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            print("Duplicate or error while committing corporate accounts.")


async def main():
    print("running main")
    await seed_corporate_accounts()

if __name__ == "__main__":
    asyncio.run(main())


load_dotenv(dotenv_path="app/core/.env")

# Settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Fake user for demo
fake_user = {
    "username": "admin",
    "password": "admin"  # Never do this in real life!
}

# JWT helper
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Auth endpoint
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != fake_user["username"] or form_data.password != fake_user["password"]:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Protected route
@app.get("/protected")
def protected(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"message": f"Hello, {username}!"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/lala")
async def login():
    await seed_corporate_accounts()
    return "success"