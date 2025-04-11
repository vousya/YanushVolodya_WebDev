import datetime
import re
from pydantic import BaseModel, field_validator
from datetime import date


GROUP_NAMES = ["PZ-12", "PZ-22", "IR-22", "PZ-81", "PZ-25"]


class StudentCreate(BaseModel):
    group_name: str
    name: str
    birthday: date
    gender: str

    @field_validator('group_name')
    @classmethod
    def validate_group(cls, group_name):
        if group_name not in GROUP_NAMES:
            raise ValueError("Group name validation error in StudentCreate scheme")
        return group_name

    @field_validator('name')
    @classmethod
    def validate_name(cls, name):
        if not (2 <= len(name) <= 50):
            raise ValueError("Name must be between 2 and 50 characters")
        if not re.match(r"^[A-Za-z]+([ '`-][A-Za-z]+)*$", name):
            raise ValueError("Student name validation error in StudentCreate scheme")
        return name

    @field_validator('birthday')
    @classmethod
    def validate_birthday(cls, date):
        current_year = datetime.date.today().year
        too_old = current_year - 80
        too_young = current_year - 17
        if (date.year > too_young) or (date.year < too_old):
            raise ValueError("Student birthday validation error in StudentCreate scheme")
        return date

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, gender):
        if gender not in ['M', 'F']:
            raise ValueError("Student gender validation error in StudentCreate scheme")
        return gender


class StudentUpdate(BaseModel):
    group_name: str
    name: str
    birthday: date
    gender: str
    status: bool

    @field_validator('group_name')
    @classmethod
    def validate_group(cls, group_name):
        if group_name not in GROUP_NAMES:
            raise ValueError("Group name validation error in StudentCreate scheme")
        return group_name

    @field_validator('name')
    @classmethod
    def validate_name(cls, name):
        if not (2 <= len(name) <= 50):
            raise ValueError("Name must be between 2 and 50 characters")
        if not re.match(r"^[A-Za-z]+([ '`-][A-Za-z]+)*$", name):
            raise ValueError("Student name validation error in StudentCreate scheme")
        return name

    @field_validator('birthday')
    @classmethod
    def validate_birthday(cls, date):
        current_year = datetime.date.today().year
        too_old = current_year - 80
        too_young = current_year - 17
        if (date.year > too_young) or (date.year < too_old):
            raise ValueError("Student birthday validation error in StudentCreate scheme")
        return date

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, gender):
        if gender not in ['M', 'F']:
            raise ValueError("Student gender validation error in StudentCreate scheme")
        return gender


class StudentResponse(BaseModel):
    group_name: str
    name: str
    gender: str
    birthday: date
    status: bool


class StudentsResponse(BaseModel):
    students: list[StudentResponse]
