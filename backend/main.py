from fastapi import FastAPI
from app.api.v1 import students

app = FastAPI()

app.include_router(students.router)
