from app.core.models import Student, Login
from sqlalchemy import select

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
                session.add(student_db)
            await session.refresh(student_db)

        async for session in database.get_session():
            result = await session.execute(select(Student)
                    .where(Student.student_id == student_db.student_id))
            student = result.scalar_one_or_none()
            post = generate_corporate_post(student.name, student.group_name)
            password = str(student.birthday)

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
                result = await session.execute(select(Student)
                        .where(Student.student_id == student_id)
                )
                student = result.scalars().first()

                if not student:
                    raise ValueError("Student not found")

                for field, value in student_update.model_dump(exclude_unset=True).items():
                    setattr(student, field, value)

            await session.refresh(student)
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


student_service = StudentService()