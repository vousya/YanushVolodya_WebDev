from app.core.models import Student
from sqlalchemy import select

class StudentService:
    @classmethod
    async def get_all_students(cls, database) -> list[Student]:
        async for session in database.get_session():
            result = await session.execute(select(Student))
            students = result.scalars().all()
            for student in students:
                print(student)
            return students

    @classmethod
    async def get_student(cls, database, name, birthday, group_name) -> Student:
        async for session in database.get_session():
            result = await session.execute(select(Student)
                                            .where(Student.name == name)
                                            .where(Student.group_name == group_name)
                                            .where(Student.birthday == birthday))
            student = result.scalars().first()
            print(student)
            return student

student_service = StudentService()