import datetime

from click import group

from app.api.v1.students import student_service
from app.core import postgres_database
from fastapi import APIRouter, Depends
from app.core.schemas import StudentResponse, StudentsResponse

router = APIRouter(tags=["Students"])

@router.get(
    "/students",
    response_model=StudentsResponse
)
async def get_students():
    students = await student_service.get_all_students(postgres_database)
    response = StudentsResponse(students=[StudentResponse(
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    ) for student in students])
    return (response)

@router.get(
    "/students/student",
    response_model=StudentResponse
)
async def get_student(
        name: str,
        birthday: datetime.date,
        group_name: str
):
    student = await student_service.get_student(
        database=postgres_database,
        name = name,
        birthday = birthday,
        group_name = group_name)
    return StudentResponse(
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    )