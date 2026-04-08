from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import verify_password, hash_password, create_access_token
from ..dependencies import get_current_user
from .. import models, schemas

router = APIRouter()


@router.post("/register", response_model=schemas.TokenWithUser, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    user = models.User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=schemas.TokenWithUser)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
        )
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
