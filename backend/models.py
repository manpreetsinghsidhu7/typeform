from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
import datetime
import uuid

from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    forms = relationship("Form", back_populates="owner", cascade="all, delete-orphan")

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, index=True, default="Untitled Form")
    status = Column(String, default="draft") # 'draft' or 'published'
    is_public = Column(Boolean, default=True) # Whether it's visible on the public homepage
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id"))
    title = Column(String, default="New Question")
    description = Column(String, nullable=True)
    type = Column(String, default="short_text") # short_text, long_text, multiple_choice, etc.
    is_required = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    options = Column(Text, nullable=True) # Stored as JSON string for multiple choice options

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id"))
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    response_id = Column(String, ForeignKey("responses.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    value = Column(Text) # Store all answers as text for simplicity

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
