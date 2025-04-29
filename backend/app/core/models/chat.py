from beanie import Document
from datetime import datetime
from typing import List, Optional

class Message(Document):
    text: str
    sender_id: str
    chat_id: str
    created_at: datetime = datetime.now()

    class Settings:
        name = "messages"

class Chat(Document):
    name: str
    participants: List[str]
    created_at: datetime = datetime.now()

    class Settings:
        name = "chats"