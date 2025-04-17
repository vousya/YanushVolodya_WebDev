from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import students

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
