from app.api.v1.students import student_service
from app.core.database import postgres_database
from fastapi import APIRouter, Depends, HTTPException
from app.core.schemas import StudentResponse, StudentsResponse, StudentCreate, StudentUpdate
from fastapi.security import OAuth2PasswordRequestForm
from app.core.aunthefication import authenticate_user, create_access_token, validate_token


router = APIRouter(tags=["Students"])


@router.get(
    "/students",
    dependencies=[Depends(validate_token)],
    response_model=StudentsResponse
)
async def get_students():
    students = await student_service.get_all_students(postgres_database)
    response = StudentsResponse(students=[StudentResponse(
        student_id=student.student_id,
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    ) for student in students])
    return (response)


@router.get(
    "/students/{student_id}",
    dependencies=[Depends(validate_token)],
    response_model=StudentResponse
)
async def get_student(
        student_id: int
):
    student = await student_service.get_student(database=postgres_database, student_id=student_id)
    return StudentResponse(
        student_id=student.student_id,
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    )


@router.post(
    "/students",
    dependencies=[Depends(validate_token)],
    response_model=StudentResponse
)
async def create_student(
    student: StudentCreate
):
    student_db = await student_service.create_student(database=postgres_database, student=student)
    return StudentResponse(
        student_id=student_db.student_id,
        group_name=student_db.group_name,
        name=student_db.name,
        gender=student_db.gender,
        birthday=student_db.birthday,
        status=student_db.status
    )


@router.patch(
    "/students/{student_id}",
    dependencies=[Depends(validate_token)],
    response_model=StudentResponse
)
async def edit_student(
    student_id: int,
    student_update: StudentUpdate
):
    student = await student_service.edit_student(database=postgres_database, student_update=student_update, student_id=student_id)
    return StudentResponse(
        student_id=student.student_id,
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    )


@router.delete(
    "/students/{student_id}",
    dependencies=[Depends(validate_token)],
    response_model=StudentResponse
)
async def delete_student(
    student_id: int,
):
    student = await student_service.delete_student(database=postgres_database, student_id=student_id)
    return StudentResponse(
        student_id=student.student_id,
        group_name=student.group_name,
        name=student.name,
        gender=student.gender,
        birthday=student.birthday,
        status=student.status
    )


@router.post(
    "/token",
)
async def login(
        form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}