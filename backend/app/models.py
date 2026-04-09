from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_icon = Column(String, default="👤")
    theme = Column(String, default="dark")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)          # "income" | "expense"
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Outros")
    payment_method = Column(String, nullable=True)  # cartao, pix, dinheiro...
    person_name = Column(String, nullable=True)     # dono do cartão
    date = Column(DateTime(timezone=True), nullable=False)
    is_installment = Column(Boolean, default=False)
    is_recurring = Column(Boolean, default=False)
    total_installments = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")
    installments = relationship(
        "Installment", back_populates="transaction", cascade="all, delete-orphan"
    )


class Installment(Base):
    __tablename__ = "installments"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(
        Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    installment_number = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    transaction = relationship("Transaction", back_populates="installments")
