from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, CHAR, Date, Boolean, Integer

Base = declarative_base()

class Student(Base):
    __tablename__ = 'students'

    student_id = Column(Integer, primary_key=True)
    group_name = Column(String, nullable=False)
    name = Column(String, nullable=False)
    birthday = Column(Date, nullable=False)
    gender = Column(CHAR(1), nullable=False)
    status = Column(Boolean, nullable=False)

    def __repr__(self):
        return f"{self.student_id}, {self.group_name}, {self.name}, {self.birthday}, {self.gender}, {self.status}"