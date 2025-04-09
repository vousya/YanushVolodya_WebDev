import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, CHAR, Date, Boolean
from dotenv import load_dotenv
import os

env_url = "/home/vovus/Vovus/YanushVolodya_WebDev/backend/app/core/.env"
load_dotenv(dotenv_path=env_url)
database_url = os.getenv("DATABASE_URL")

engine = create_async_engine(database_url, echo=True)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

Base = declarative_base()

# Define your model
class People(Base):
    __tablename__ = 'people'

    group_name = Column(String, primary_key=True)
    name = Column(String, primary_key=True)
    birthday = Column(Date, primary_key=True)
    gender = Column(CHAR(1), nullable=False)
    status = Column(Boolean, nullable=False)

# Async function to fetch all people
async def get_all_people():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            # select all rows
            People.__table__.select()
        )
        rows = result.fetchall()
        for row in rows:
            print(row)


# Run when file is executed directly
if __name__ == "__main__":
    asyncio.run(get_all_people())
