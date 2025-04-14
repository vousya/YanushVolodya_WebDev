import asyncio
from sqlalchemy.future import select
from app.core.database import postgres_database
from app.core.models import Student, Login
from app.core.aunthefication import hash_password
import os
from dotenv import load_dotenv
from app.api.v1.students import generate_corporate_post

load_dotenv("app/core/.env")
SECRET_KEY = os.getenv("SECRET_KEY")

async def populate_login_table():
    async for session in postgres_database.get_session():
        result = await session.execute(select(Student))
        students = result.scalars().all()

        for student in students:
            # Generate email and password
            email = generate_corporate_post(student.name, student.group_name)
            plain_password = student.birthday.strftime("%Y-%m-%d")
            hashed_password = hash_password(plain_password)

            # Check if login with student_id or email already exists
            existing = await session.execute(
                select(Login).where(
                    (Login.student_id == student.student_id) |
                    (Login.email == email)
                )
            )
            if existing.scalar():
                continue

            login = Login(
                student_id=student.student_id,
                email=email,
                password=hashed_password,
            )
            session.add(login)

        await session.commit()
        print("Login table populated.")



if __name__ == "__main__":
    asyncio.run(populate_login_table())

