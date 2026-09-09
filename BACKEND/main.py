from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, cards, payments, dashboard

# Create tables
print(" Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

app = FastAPI(title="CreditWise API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(payments.router)
app.include_router(dashboard.router)

@app.get("/")
def home():
    return {"message": "Welcome to CreditWise API! 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy", "database": "PostgreSQL"}