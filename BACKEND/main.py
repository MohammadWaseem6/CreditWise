
from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.database import engine, Base
from app.routes import auth, cards,payments,dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreditWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(payments.router)      # ← NEW
app.include_router(dashboard.router)     # ← NEW


@app.get("/")
def home():
    return {"message": "CreditWise API is running!"}
