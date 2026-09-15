
# PURPOSE: Connect to PostgreSQL and provide database sessions


# Import create_engine: creates the connection pool to PostgreSQL
from sqlalchemy import create_engine

# Import declarative_base (parent class for all models)
# Import sessionmaker (factory to create DB sessions)
from sqlalchemy.orm import declarative_base, sessionmaker

# Import load_dotenv: reads .env file and loads variables into environment
from dotenv import load_dotenv

# Import os: gives us os.getenv() to read environment variables
import os

# Load .env file — MUST be called BEFORE any os.getenv() call!
load_dotenv()

# Read DATABASE_URL from environment
# Example: "postgresql://postgres@localhost:5432/creditwise"
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the engine (connection pool manager)
# Think of it as: a taxi fleet that manages DB connections
engine = create_engine(DATABASE_URL)

# Create the session factory (SessionLocal)
# This is a "factory" — we call SessionLocal() to make new sessions
SessionLocal = sessionmaker(
    bind=engine,           # Use the engine we created above
    autocommit=False,      # Don't save automatically — we control when to commit
    autoflush=False,       # Don't send to DB until we're ready
)

# Create Base class — every model inherits from this
# SQLAlchemy uses this to know which classes are database tables
Base = declarative_base()

# Function: get_db()
# Provides a database session to FastAPI endpoints
# FastAPI calls this automatically via Depends(get_db)
def get_db():
    """
    Provides a database session to FastAPI endpoints.
    FastAPI calls this automatically via Depends(get_db).
    """
    # Create a new session (one conversation with the database)
    db = SessionLocal()
    try:
        # Give the session to the endpoint
        # PAUSE here until endpoint finishes
        yield db
    finally:
        # ALWAYS runs — even if endpoint crashes
        # Returns the connection to the pool
        db.close()