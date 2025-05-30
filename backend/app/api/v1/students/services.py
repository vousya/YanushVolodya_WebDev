from app.core.models import Student, Login, Message, Chat
from app.core.aunthefication import get_student_id, hash_password
from app.core.websockets import websockets_helper

from sqlalchemy import select
from bson import ObjectId


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
    async def send_message(cls, database, message):
        message_db = Message(
            text=message.text,
            sender_id=message.sender_id,
            created_at=message.created_at,
            chat_id=message.chat_id
        )

        await message_db.insert()
        print("Added message")

        chat = await Chat.get(ObjectId(message.chat_id))

        chat_participants = chat.participants

        print(chat_participants)

        await websockets_helper.send_message(chat_participants, message)

        return message_db

    @classmethod
    async def get_chats(cls, database, access_token):
        student_id = str(get_student_id(access_token))
        print("student_id:", student_id, type(student_id))
        chats = await Chat.find({"participants": student_id}).to_list()

        print("chats:", chats)
        if not chats:
            return None

        return chats

    @classmethod
    async def get_messages(cls, chat_id):
        messages = await Message.find(Message.chat_id == chat_id).to_list()

        if not messages:
            return None

        return messages

    @classmethod
    async def get_participants(cls, database, chat_id: str):
        chat = await Chat.find_one({"_id": ObjectId(chat_id)})

        if not chat:
            return None

        participants = {}
        async for session in database.get_session():
            async with session.begin():
                for participant in chat.participants:
                    result = await session.execute(select(Student)
                        .where(Student.student_id == int(participant))
                    )
                    student = result.scalar_one_or_none()
                    if student:
                        participants[student.student_id] = student.name

        print("participants:", participants)
        return participants

    @classmethod
    async def create_chat(cls, chat):
        new_chat = Chat(
            name=chat.name,
            participants=chat.participants,
            created_at=chat.created_at
        )

        await new_chat.insert()
        print("Added new_chat")

        return new_chat

    @classmethod
    async def edit_chat(cls, chat_id, chat_update_data):
        chat = await Chat.get(chat_id)
        if not chat:
            raise ValueError(f"Chat with id {chat_id} not found")

        if hasattr(chat_update_data, "name") and chat_update_data.name is not None:
            chat.name = chat_update_data.name

        if hasattr(chat_update_data, "participants") and chat_update_data.participants is not None:
            chat.participants = chat_update_data.participants

        if hasattr(chat_update_data, "created_at") and chat_update_data.created_at is not None:
            chat.created_at = chat_update_data.created_at

        await chat.save()
        print(f"Patched chat {chat_id}")

        return chat

    @classmethod
    async def login(cls, websocket, database):
        result = await websockets_helper.login(websocket=websocket, database=database)

        if not result:
            return None

        return result

    @classmethod
    async def connect(cls, websocket, database):
        result = await websockets_helper.connect(websocket=websocket, database=database)

        if not result:
            return None

        return result


student_service = StudentService()
