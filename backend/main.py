import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud, auth
from database import engine, get_db
from fastapi.security import OAuth2PasswordRequestForm

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Typeform API")

# Setup CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    origins.append(frontend_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.head("/")
def read_root():
    return {"message": "Typeform API is running"}

import seed
@app.get("/api/run-seed")
def run_seed():
    seed.seed_data()
    return {"message": "Database successfully seeded via API!"}

# --- Auth Endpoints ---
@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = crud.get_user_by_email(db, email=user.email)
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Form Endpoints ---
@app.get("/api/forms", response_model=List[schemas.Form])
def get_forms(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user_optional)):
    if current_user:
        return crud.get_forms(db, only_public_and_published=False, user_id=current_user.id)
    else:
        return crud.get_forms(db, only_public_and_published=True)

@app.post("/api/forms", response_model=schemas.Form)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.create_form(db=db, form=form, user_id=current_user.id)

@app.get("/api/forms/{form_id}", response_model=schemas.Form)
def get_form(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.put("/api/forms/{form_id}", response_model=schemas.Form)
def update_form(form_id: str, form: schemas.FormUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_form = crud.update_form(db, form_id=form_id, form=form)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.delete("/api/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    crud.delete_form(db, form_id=form_id)
    return {"message": "Form deleted successfully"}

# --- Question Endpoints ---
@app.post("/api/forms/{form_id}/questions", response_model=schemas.Question)
def create_question(form_id: str, question: schemas.QuestionCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.create_question(db=db, form_id=form_id, question=question)

@app.put("/api/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: str, question: schemas.QuestionUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_question = crud.update_question(db, question_id=question_id, question=question)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    crud.delete_question(db, question_id=question_id)
    return {"message": "Question deleted successfully"}

@app.put("/api/forms/{form_id}/questions/reorder", response_model=schemas.Form)
def reorder_questions(form_id: str, ordered_ids: List[str], db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.reorder_questions(db=db, form_id=form_id, ordered_ids=ordered_ids)

# --- Response Endpoints ---
@app.post("/api/forms/{form_id}/responses", response_model=schemas.Response)
def submit_response(form_id: str, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    # Verify form is published
    db_form = crud.get_form(db, form_id=form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    if db_form.status != "published":
        raise HTTPException(status_code=400, detail="Cannot submit response to an unpublished form")
    
    return crud.create_response(db=db, form_id=form_id, response=response)

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.Response])
def get_responses(form_id: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.get_responses_for_form(db, form_id=form_id)
