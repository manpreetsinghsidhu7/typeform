from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

    model_config = {"from_attributes": True}


# --- Answer Schemas ---
class AnswerBase(BaseModel):
    question_id: str
    value: str

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: str
    response_id: str

    model_config = {"from_attributes": True}

# --- Response Schemas ---
class ResponseBase(BaseModel):
    pass

class ResponseCreate(ResponseBase):
    answers: List[AnswerCreate]

class Response(ResponseBase):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[Answer] = []

    model_config = {"from_attributes": True}

# --- Question Schemas ---
class QuestionBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    is_required: bool = False
    order: int = 0
    options: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[str] = None

class Question(QuestionBase):
    id: str
    form_id: str

    model_config = {"from_attributes": True}

# --- Form Schemas ---
class FormBase(BaseModel):
    title: str
    status: str = "draft"
    is_public: bool = True

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None

class Form(FormBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    questions: List[Question] = []
    
    # We might not want to always load all responses when fetching a form
    # responses: List[Response] = [] 

    model_config = {"from_attributes": True}
