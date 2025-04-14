from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, CHAR, Date, Boolean, Integer, ForeignKey

Base = declarative_base()

class Login(Base):
    __tablename__ = "login"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), unique=True)
    email = Column(String, unique=True, index=True)  # e.g., joseph.devis.pz81@lpnu.ua
    password = Column(String)  # birthday as password (store as string or hash)

    student = relationship("Student")  # assuming you have a Student model

    def __repr__(self):
        return f"{self.id}, {self.student_id}, {self.email}, {self.password}"


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