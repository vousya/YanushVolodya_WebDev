from app.api.v1.students import student_service
from app.core.databases import postgres_database, mongo_database
from fastapi import APIRouter, Depends, HTTPException
from app.core.schemas import StudentResponse, StudentsResponse, StudentCreate, StudentUpdate, Chat, Message
from fastapi.security import OAuth2PasswordRequestForm
from app.core.aunthefication import validate_token


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

    if not student_db:
        raise HTTPException(status_code=400, detail="We already have this student")

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
    data = await student_service.login_user(database=postgres_database, email=form_data.username, password=form_data.password)

    if not data:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"access_token": data["token"], "token_type": "bearer", "student_id" : data["student_id"]}


@router.post(
    "/logout",
    dependencies=[Depends(validate_token)],
)
async def logout(
        token: str
):
    result = await student_service.logout_student(database=postgres_database, token=token)
    if not result:
        return "Failed to log out"
    return "Successfully logged out"


@router.post(
    "/message",
    #dependencies=[Depends(validate_token)],
)
async def send_message(
    message: Message
):
    message = await student_service.send_message(database=mongo_database, message=message)

    if not message:
        raise HTTPException(status_code=400, detail="Error while sending message")

    return {"message" : message.text, "chat_id" : message.chat_id, "sender": message.sender_id, "created at" : message.created_at}


@router.get(
    "/chats",
    #dependencies=[Depends(validate_token)],
)
async def get_chats(
        access_token: str
):
    chats = await student_service.get_chats(database=postgres_database, access_token=access_token)

    if not chats:
        raise HTTPException(status_code=400, detail="Error while getting chats")

    return chats


@router.get(
    "/messages",
    #dependencies=[Depends(validate_token)],
)
async def get_messages(
        chat_id: str
):
    messages = await student_service.get_messages(chat_id=chat_id)

    if not messages:
        raise HTTPException(status_code=400, detail="Error while getting messages")

    return messages


@router.get(
    "/participants",
    #dependencies=[Depends(validate_token)],
)
async def get_participants(
        chat_id: str
):
    participants = await student_service.get_participants(database=postgres_database, chat_id=chat_id)

    print(participants)
    if not participants:
        raise HTTPException(status_code=400, detail="Error while getting messages")

    return participants


@router.post(
    "/chat",
    #dependencies=[Depends(validate_token)],
)
async def create_chat(
    chat : Chat
):
    result = await student_service.create_chat(chat=chat)

    if not result:
        raise HTTPException(status_code=400, detail="Error while getting chats")

    return result