from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import verify_password, hash_password
from ..dependencies import get_current_user
from .. import models, schemas

router = APIRouter()


@router.put("/me", response_model=schemas.UserResponse)
def update_profile(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.avatar_icon is not None:
        current_user.avatar_icon = payload.avatar_icon
    if payload.theme is not None:
        current_user.theme = payload.theme
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(
    payload: schemas.UserPasswordUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Senha alterada com sucesso"}
