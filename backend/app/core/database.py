from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from dotenv import load_dotenv
import os


class Database:
    def __init__(self):
        self.engine = self.create_engine()
        self.session = self.get_session
    def create_engine(self):
        load_dotenv(dotenv_path=".env")
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL is not found in the .env file.")
        engine = create_async_engine(database_url, echo=True)
        return engine

    async def get_session(self):
        async with AsyncSession(bind=self.engine) as session:
            yield session


database = Database()