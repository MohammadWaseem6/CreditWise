from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, cards, payments, dashboard, badges, simulator, leaderboard, charts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreditWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://credit-wise-vert.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
app.include_router(badges.router)
app.include_router(simulator.router)
app.include_router(leaderboard.router)
app.include_router(charts.router)

@app.get("/")
def home():
    return {"message": "CreditWise API is running!"}