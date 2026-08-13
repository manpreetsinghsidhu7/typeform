from sqlalchemy.orm import Session
import models, schemas

# --- Users ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Forms ---
def get_forms(db: Session, only_public_and_published: bool = False, user_id: str = None):
    query = db.query(models.Form)
    if only_public_and_published:
        query = query.filter(models.Form.status == "published", models.Form.is_public == True)
    elif user_id:
        query = query.filter(models.Form.user_id == user_id)
    return query.order_by(models.Form.created_at.desc()).all()

def get_form(db: Session, form_id: str):
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def create_form(db: Session, form: schemas.FormCreate, user_id: str):
    db_form = models.Form(**form.dict(), user_id=user_id)
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

def update_form(db: Session, form_id: str, form: schemas.FormUpdate):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return None
    for key, value in form.dict(exclude_unset=True).items():
        setattr(db_form, key, value)
    db.commit()
    db.refresh(db_form)
    return db_form

def delete_form(db: Session, form_id: str):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form:
        db.delete(db_form)
        db.commit()
    return db_form

# --- Questions ---
def create_question(db: Session, form_id: str, question: schemas.QuestionCreate):
    db_question = models.Question(**question.dict(), form_id=form_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: str, question: schemas.QuestionUpdate):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return None
    for key, value in question.dict(exclude_unset=True).items():
        setattr(db_question, key, value)
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: str):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if db_question:
        db.delete(db_question)
        db.commit()
    return db_question

def reorder_questions(db: Session, form_id: str, ordered_ids: list[str]):
    # Note: Using SQLite, we can just do individual updates for simplicity
    for index, q_id in enumerate(ordered_ids):
        db_question = db.query(models.Question).filter(models.Question.id == q_id, models.Question.form_id == form_id).first()
        if db_question:
            db_question.order = index
    db.commit()
    return db.query(models.Form).filter(models.Form.id == form_id).first()

# --- Responses ---
def create_response(db: Session, form_id: str, response: schemas.ResponseCreate):
    db_response = models.Response(form_id=form_id)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    for answer_data in response.answers:
        db_answer = models.Answer(
            response_id=db_response.id,
            question_id=answer_data.question_id,
            value=answer_data.value
        )
        db.add(db_answer)
    
    db.commit()
    db.refresh(db_response)
    return db_response

def get_responses_for_form(db: Session, form_id: str):
    return db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
