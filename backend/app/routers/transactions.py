from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List
from ..database import get_db
from ..dependencies import get_current_user
from .. import models, schemas

router = APIRouter()


def add_months(dt: datetime, months: int) -> datetime:
    import calendar
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


@router.get("/summary", response_model=schemas.BalanceSummary)
def get_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import calendar as cal
    uid = current_user.id
    now = datetime.utcnow()
    cur_month_end = datetime(now.year, now.month,
                             cal.monthrange(now.year, now.month)[1], 23, 59, 59)

    # ── Income ────────────────────────────────────────────────────────────────
    total_income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == uid,
        models.Transaction.type == "income",
    ).scalar() or 0.0

    # ── Non-installment expenses (paid immediately) ───────────────────────────
    non_installment = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == uid,
        models.Transaction.type == "expense",
        models.Transaction.is_installment == False,
    ).scalar() or 0.0

    # ── Installment expenses: paid ────────────────────────────────────────────
    paid_inst = (
        db.query(func.sum(models.Installment.amount))
        .join(models.Transaction)
        .filter(
            models.Transaction.user_id == uid,
            models.Installment.is_paid == True,
        )
        .scalar() or 0.0
    )

    # ── Installment expenses: pending due on or before end of current month ───
    # For recurring/installments we only count what's actually due this month,
    # not all future installments — avoids inflating balance with years of rent
    pending_inst = (
        db.query(func.sum(models.Installment.amount))
        .join(models.Transaction)
        .filter(
            models.Transaction.user_id == uid,
            models.Installment.is_paid == False,
            models.Installment.due_date <= cur_month_end,
        )
        .scalar() or 0.0
    )

    paid_amount = non_installment + paid_inst
    total_expenses = non_installment + paid_inst + pending_inst
    balance = total_income - total_expenses
    available = total_income - paid_amount

    # ── Monthly data (last 6 months) ─────────────────────────────────────────
    MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                 "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    monthly_data = []
    for i in range(5, -1, -1):
        month = (now.month - 1 - i) % 12 + 1
        year = now.year + ((now.month - 1 - i) // 12)
        if (now.month - 1 - i) < 0:
            year -= 1
        m_start = datetime(year, month, 1)
        m_end = datetime(year, month, cal.monthrange(year, month)[1], 23, 59, 59)

        m_income = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == uid,
            models.Transaction.type == "income",
            models.Transaction.date >= m_start,
            models.Transaction.date <= m_end,
        ).scalar() or 0.0

        # Non-installment expenses by transaction date
        m_exp_non_inst = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == uid,
            models.Transaction.type == "expense",
            models.Transaction.is_installment == False,
            models.Transaction.date >= m_start,
            models.Transaction.date <= m_end,
        ).scalar() or 0.0

        # Installment expenses by installment due_date (each parcel in its real month)
        m_exp_inst = (
            db.query(func.sum(models.Installment.amount))
            .join(models.Transaction)
            .filter(
                models.Transaction.user_id == uid,
                models.Transaction.type == "expense",
                models.Installment.due_date >= m_start,
                models.Installment.due_date <= m_end,
            )
            .scalar() or 0.0
        )

        monthly_data.append({
            "month": MONTHS_PT[month - 1],
            "year": year,
            "income": round(float(m_income), 2),
            "expenses": round(float(m_exp_non_inst + m_exp_inst), 2),
        })

    # ── Category data (current month) ────────────────────────────────────────
    cur_start = datetime(now.year, now.month, 1)

    # Non-installment by transaction date
    cat_non_inst = (
        db.query(models.Transaction.category, func.sum(models.Transaction.amount))
        .filter(
            models.Transaction.user_id == uid,
            models.Transaction.type == "expense",
            models.Transaction.is_installment == False,
            models.Transaction.date >= cur_start,
            models.Transaction.date <= cur_month_end,
        )
        .group_by(models.Transaction.category)
        .all()
    )

    # Installment by installment due_date
    cat_inst = (
        db.query(models.Transaction.category, func.sum(models.Installment.amount))
        .join(models.Installment)
        .filter(
            models.Transaction.user_id == uid,
            models.Transaction.type == "expense",
            models.Installment.due_date >= cur_start,
            models.Installment.due_date <= cur_month_end,
        )
        .group_by(models.Transaction.category)
        .all()
    )

    cat_totals: dict = {}
    for cat, amt in cat_non_inst:
        cat_totals[cat] = cat_totals.get(cat, 0.0) + float(amt)
    for cat, amt in cat_inst:
        cat_totals[cat] = cat_totals.get(cat, 0.0) + float(amt)
    category_data = [{"category": c, "amount": round(a, 2)} for c, a in cat_totals.items()]

    return {
        "total_income": round(float(total_income), 2),
        "total_expenses": round(float(total_expenses), 2),
        "paid_amount": round(float(paid_amount), 2),
        "pending_installments": round(float(pending_inst), 2),
        "balance": round(float(balance), 2),
        "available": round(float(available), 2),
        "monthly_data": monthly_data,
        "category_data": category_data,
    }


@router.get("", response_model=List[schemas.TransactionResponse])
def list_transactions(
    type: Optional[str] = None,
    category: Optional[str] = None,
    is_installment: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if type:
        q = q.filter(models.Transaction.type == type)
    if category:
        q = q.filter(models.Transaction.category == category)
    if is_installment is not None:
        q = q.filter(models.Transaction.is_installment == is_installment)
    q = q.order_by(models.Transaction.date.desc())
    return q.offset(skip).limit(limit).all()


@router.post("", response_model=schemas.TransactionResponse, status_code=201)
def create_transaction(
    payload: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = models.Transaction(
        user_id=current_user.id,
        type=payload.type,
        description=payload.description,
        amount=payload.amount,
        category=payload.category,
        payment_method=payload.payment_method,
        person_name=payload.person_name,
        date=payload.date,
        is_installment=payload.is_installment,
        is_recurring=payload.is_recurring,
        total_installments=payload.total_installments,
    )
    db.add(txn)
    db.flush()

    if payload.is_installment and payload.total_installments:
        n = payload.total_installments
        inst_amount = round(payload.amount / n, 2)
        first_due = payload.first_due_date or add_months(
            payload.date.replace(day=1), 1
        )
        for i in range(n):
            due = add_months(first_due, i)
            db.add(
                models.Installment(
                    transaction_id=txn.id,
                    installment_number=i + 1,
                    amount=inst_amount,
                    due_date=due,
                    is_paid=False,
                )
            )

    db.commit()
    db.refresh(txn)
    return txn


@router.patch("/{txn_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    txn_id: int,
    payload: schemas.TransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    if payload.category is not None:
        txn.category = payload.category
    if payload.payment_method is not None:
        txn.payment_method = payload.payment_method
    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}", status_code=204)
def delete_transaction(
    txn_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(txn)
    db.commit()
