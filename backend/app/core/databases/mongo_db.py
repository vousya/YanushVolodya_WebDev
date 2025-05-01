from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os
from app.core.models import all_models

class MongoDatabase:
    def __init__(self):
        load_dotenv(dotenv_path="app/core/.env")
        self.client = self.create_client()
        self.db = self.client.get_database(self.get_database_name())

    def create_client(self):
        mongo_url = os.getenv("MONGO_URL")
        if not mongo_url:
            raise ValueError("MONGO_URL is not found in the .env file.")
        client = AsyncIOMotorClient(mongo_url)
        return client

    def get_database_name(self):
        db_name = os.getenv("MONGO_DB_NAME")
        if not db_name:
            raise ValueError("MONGO_DB_NAME is not found in the .env file.")
        return db_name

    async def init_beanie(self):
        await init_beanie(database=self.db, document_models=all_models)

mongo_database = MongoDatabase()
