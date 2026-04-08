from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from ..database import get_db
from ..dependencies import get_current_user
from .. import models, schemas

router = APIRouter()


@router.get("", response_model=List[schemas.InstallmentResponse])
def list_installments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Installment)
        .join(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .order_by(models.Installment.due_date)
        .all()
    )


@router.put("/{inst_id}/pay", response_model=schemas.InstallmentResponse)
def pay_installment(
    inst_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inst = (
        db.query(models.Installment)
        .join(models.Transaction)
        .filter(
            models.Installment.id == inst_id,
            models.Transaction.user_id == current_user.id,
        )
        .first()
    )
    if not inst:
        raise HTTPException(status_code=404, detail="Parcela não encontrada")
    inst.is_paid = True
    inst.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(inst)
    return inst


@router.put("/{inst_id}/unpay", response_model=schemas.InstallmentResponse)
def unpay_installment(
    inst_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inst = (
        db.query(models.Installment)
        .join(models.Transaction)
        .filter(
            models.Installment.id == inst_id,
            models.Transaction.user_id == current_user.id,
        )
        .first()
    )
    if not inst:
        raise HTTPException(status_code=404, detail="Parcela não encontrada")
    inst.is_paid = False
    inst.paid_at = None
    db.commit()
    db.refresh(inst)
    return inst
