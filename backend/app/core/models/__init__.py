__all__ = [
    "Student",
    "Login",
    "Chat",
    "Message",
    "all_models"
]

from .student import Student, Login
from .chat import Message, Chat

all_models = {
    Message,
    Chat
}
