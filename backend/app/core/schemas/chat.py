from pydantic import BaseModel, field_validator
from datetime import date


class Message(BaseModel):
    text: str
    sender_id: str
    chat_id: str
    created_at: date

    @field_validator('text')
    @classmethod
    def validate_text(cls, text):
        if len(text) == 0 or len(text) > 1000:
            raise ValueError("Text size error in Message scheme")
        return text


class Chat(BaseModel):
    name: str
    participants: list[str]
    created_at: date

    @field_validator('name')
    @classmethod
    def validate_name(cls, name):
        if len(name) == 0 or len(name) > 50:
            raise ValueError("Group name size error in Chat scheme")
        return name

    @field_validator('participants')
    @classmethod
    def validate_participants(cls, participants):
        if len(participants) == 0 or len(participants) > 1000:
            raise ValueError("Group chat participants size error in Chat scheme")
        return participants