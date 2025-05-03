from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import students
from contextlib import asynccontextmanager
from app.core.databases import mongo_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo_database.init_beanie()
    print("MongoDB connected and Beanie initialized.")

    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(students.router)
