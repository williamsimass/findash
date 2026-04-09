from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, transactions, installments

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dashboard Financeiro API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/auth",         tags=["Auth"])
app.include_router(users.router,        prefix="/users",        tags=["Users"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(installments.router, prefix="/installments", tags=["Installments"])


@app.get("/health")
def health():
    return {"status": "ok"}
