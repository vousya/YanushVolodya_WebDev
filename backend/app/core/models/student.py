from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, CHAR, Date, Boolean

Base = declarative_base()

class Students(Base):
    __tablename__ = 'people'

    group_name = Column(String, primary_key=True)
    name = Column(String, primary_key=True)
    birthday = Column(Date, primary_key=True)
    gender = Column(CHAR(1), nullable=False)
    status = Column(Boolean, nullable=False)
