from app.core.models import Student
from sqlalchemy import select

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
                session.add(student_db)  # Add the new student without specifying the student_id
            await session.refresh(student_db)  # Refresh to get the student ID
            return student_db  # student_db will now contain the auto-generated student_id

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