from app.core.models import Student, Login
from sqlalchemy import select
from app.core.aunthefication import hash_password
from app.core.aunthefication import authenticate_user, create_access_token, get_email


def generate_corporate_post(name: str, group: str) -> str:
    name = name.lower().replace(" ", ".")
    group = group.lower().replace("-", "")
    return f"{name}.{group}@lpnu.ua"


class StudentService:
    @classmethod
    async def get_all_students(cls, database) -> list[Student]:
        async for session in database.get_session():
            result = await session.execute(select(Student))
            students = result.scalars().all()
            return students

    @classmethod
    async def get_student(cls, database, student_id: int) -> Student:
        async for session in database.get_session():
            result = await session.execute(select(Student).where(Student.student_id == student_id))
            student = result.scalars().first()
            return student

    @classmethod
    async def create_student(cls, database, student) -> Student:
        student_db = Student(
            group_name=student.group_name,
            name=student.name,
            birthday=student.birthday,
            gender=student.gender,
            status=student.status
        )

        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(select(Student)
                        .where(Student.name == student_db.name)
                        .where(Student.group_name == student_db.group_name))
                student = result.scalar_one_or_none()
                if student:
                    return None
                session.add(student_db)
            await session.refresh(student_db)

        async for session in database.get_session():
            result = await session.execute(select(Student)
                    .where(Student.student_id == student_db.student_id))
            student = result.scalar_one_or_none()
            post = generate_corporate_post(student.name, student.group_name)
            password = hash_password(str(student.birthday))

            result = await session.execute(select(Login)
                    .where(Login.email == post)
                    .where(Login.password == password)
            )
            existing = result.scalar_one_or_none()

            if not existing:
                new_account = Login(
                    student_id=student.student_id,
                    email=post,
                    password=password
                )
                session.add(new_account)
                await session.commit()

        return student_db

    @classmethod
    async def edit_student(cls, database, student_update, student_id) -> Student:
        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(
                    select(Student).where(Student.student_id == student_id)
                )
                student = result.scalars().first()

                if not student:
                    raise ValueError("Student not found")

                for field, value in student_update.model_dump(exclude_unset=True).items():
                    setattr(student, field, value)

            await session.refresh(student)

        post = generate_corporate_post(student.name, student.group_name)

        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(
                    select(Login).where(Login.student_id == student.student_id)
                )
                login = result.scalar_one_or_none()

                if login:
                    login.email = post
                else:
                    new_login = Login(
                        student_id=student.student_id,
                        email=post,
                        password=hash_password(str(student.birthday))
                    )
                    session.add(new_login)

        return student

    @classmethod
    async def delete_student(cls, database, student_id: int) -> None:
        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(select(Student)
                        .where(Student.student_id == student_id)
                )
                student = result.scalars().first()

                if not student:
                    raise ValueError("Student not found")

                await session.delete(student)
                return student

    @classmethod
    async def login_user(cls, email, password, database):
        user = await authenticate_user(email=email, password=password)
        if not user:
            return None

        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(select(Login)
                        .where(Login.email == email)
                )
                student = result.scalar_one_or_none()
                if not student:
                    raise ValueError("Student not found")

                result = await session.execute(select(Student)
                        .where(Student.student_id == student.student_id)
                )
                student = result.scalar_one_or_none()
                if not student:
                    raise ValueError("Student not found")

                student.status = True

            await session.refresh(student)

        access_token = create_access_token(data={"sub": email})
        return access_token

    @classmethod
    async def logout_student(cls, token, database):
        email = get_email(token)
        async for session in database.get_session():
            async with session.begin():
                result = await session.execute(select(Login)
                        .where(Login.email == email)
                )
                student_login = result.scalar_one_or_none()
                if not student_login:
                    return None

                result = await session.execute(select(Student)
                        .where(Student.student_id == student_login.student_id)
                )
                student_student = result.scalar_one_or_none()
                if not student_student:
                    return None

                student_student.status = False

            await session.refresh(student_student)
        return True

student_service = StudentService()