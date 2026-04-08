from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_icon: Optional[str] = None
    theme: Optional[str] = None


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    avatar_icon: str
    theme: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─── Installment ─────────────────────────────────────────────────────────────

class InstallmentResponse(BaseModel):
    id: int
    transaction_id: int
    installment_number: int
    amount: float
    due_date: datetime
    is_paid: bool
    paid_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ─── Transaction ─────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    type: str
    description: str
    amount: float
    category: str = "Outros"
    payment_method: Optional[str] = None
    person_name: Optional[str] = None
    date: datetime
    is_installment: bool = False
    total_installments: Optional[int] = None
    first_due_date: Optional[datetime] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    type: str
    description: str
    amount: float
    category: str
    payment_method: Optional[str]
    person_name: Optional[str]
    date: datetime
    is_installment: bool
    total_installments: Optional[int]
    created_at: datetime
    installments: List[InstallmentResponse] = []

    model_config = {"from_attributes": True}


# ─── Summary / Charts ─────────────────────────────────────────────────────────

class MonthlyData(BaseModel):
    month: str
    year: int
    income: float
    expenses: float


class CategoryData(BaseModel):
    category: str
    amount: float


class BalanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    paid_amount: float
    pending_installments: float
    balance: float
    available: float
    monthly_data: List[MonthlyData]
    category_data: List[CategoryData]
