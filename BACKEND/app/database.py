# ============================================================
# app/database.py
# 
# PURPOSE: This file handles ALL database connections
#          - Connects to PostgreSQL
#          - Creates sessions (conversations with DB)
#          - Provides Base class for models
#          - Provides get_db() for FastAPI endpoints
# ============================================================


# ============================================================
# SECTION 1: IMPORTS
# ============================================================

from sqlalchemy import create_engine
# WHY: To create a "connection pool" to the database
# WHAT: A tool that manages multiple connections efficiently

from sqlalchemy.ext.declarative import declarative_base
# WHY: To create a Base class for all our models
# WHAT: A template that tells SQLAlchemy "this class is a table"

from sqlalchemy.orm import sessionmaker
# WHY: To create sessions (conversations with the DB)
# WHAT: A factory that creates new database sessions


# ============================================================
# SECTION 2: DATABASE URL
# ============================================================

DATABASE_URL = "postgresql://postgres@localhost:5432/creditwise"
# BREAKDOWN:
#   postgresql://   → Which database? (PostgreSQL)
#   postgres        → Username (who's connecting?)
#   @               → Separator (password is empty, so nothing before @)
#   localhost       → Where? (your own computer)
#   :5432           → Which port? (PostgreSQL's default port)
#   /creditwise     → Which database? (our app's database)
#
# REAL-WORLD ANALOGY:
#   It's like a full address:
#   Country://City@Street:ZipCode/HouseNumber
#
# WHY POSTGRESQL?
#   - More powerful than SQLite
#   - Better for production
#   - Used by real companies
#
# WHY NO PASSWORD?
#   - Local development (safe)
#   - In production, ALWAYS use a password!
#
# HOW TO ADD PASSWORD:
#   "postgresql://postgres:yourpassword@localhost:5432/creditwise"


# ============================================================
# SECTION 3: CREATE THE ENGINE
# ============================================================

engine = create_engine(DATABASE_URL)
# WHAT: Creates the connection pool to the database
#
# WHY IT'S CALLED "ENGINE":
#   - It's the "engine" that powers all DB connections
#   - Like a car engine that powers the whole car
#
# WHAT IT ACTUALLY DOES:
#   1. Reads the DATABASE_URL
#   2. Establishes a connection
#   3. Creates a POOL of reusable connections
#   4. Manages them efficiently
#
# WHY A CONNECTION POOL?
#   Opening a new database connection is EXPENSIVE (takes time)
#   Instead, we reuse a pool of connections
#
# REAL-WORLD ANALOGY:
#   A restaurant with 10 waiters (connections)
#   - New customer arrives → Available waiter serves them
#   - When done → Waiter becomes available again
#   - Don't hire/fire waiters for every customer!
#
# EXAMPLE IN CODE:
#   Without pool: Open connection → Query → Close (slow)
#   With pool:    Get from pool  → Query → Return (fast)


# ============================================================
# SECTION 4: CREATE SESSION MAKER
# ============================================================

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# WHAT: Creates a factory that makes database sessions
#
# PARAMETERS EXPLAINED:
#
# autocommit=False
#   WHY: We want to control WHEN to save changes
#   WHAT: Changes aren't saved automatically
#   HOW IT WORKS: We must call db.commit() to save
#   
#   EXAMPLE:
#     db.add(user)              # Not saved yet
#     db.add(card)              # Not saved yet
#     db.commit()               # NOW both are saved!
#   
#   WHY THIS MATTERS:
#     - If error happens, nothing is saved (atomicity)
#     - You can batch multiple changes
#     - Safer for complex operations
#
# autoflush=False
#   WHY: Don't send changes until we're ready
#   WHAT: Data isn't sent to DB until commit
#   WHEN TO USE: When you want full control
#
# bind=engine
#   WHY: Connect sessions to our engine
#   WHAT: Tells sessions "use this engine for connections"
#
# REAL-WORLD ANALOGY:
#   - SessionLocal is a "session factory"
#   - Like a phone dialer that can make calls
#   - Each call = one session with the database


# ============================================================
# SECTION 5: CREATE BASE CLASS
# ============================================================

Base = declarative_base()
# WHAT: Creates a base class for all database models
#
# WHY DO WE NEED IT?
#   SQLAlchemy needs to KNOW which classes are database tables
#   We do this by making them inherit from Base
#
# HOW IT WORKS:
#   class User(Base):         ← Inherits from Base
#       __tablename__ = "users"
#       id = Column(Integer, primary_key=True)
#
#   SQLAlchemy sees User inherits from Base
#   → Automatically knows User is a table
#
# EXAMPLE:
#   class User(Base):         # SQLAlchemy knows: table "users"
#   class CreditCard(Base):   # SQLAlchemy knows: table "credit_cards"
#   class Payment(Base):      # SQLAlchemy knows: table "payments"
#
# REAL-WORLD ANALOGY:
#   Base is like a "stamp" that marks classes
#   Any class with this "stamp" is a database table
#
# WITHOUT Base:
#   class User:  # Just a regular Python class, not a table
#
# WITH Base:
#   class User(Base):  # A database table!


# ============================================================
# SECTION 6: get_db() FUNCTION (The Dependency)
# ============================================================

def get_db():
    # WHAT: Provides a database session to FastAPI endpoints
    # 
    # WHY IT EXISTS:
    #   Every API endpoint needs a DB session
    #   We don't want to manually open/close in every endpoint
    #   So FastAPI handles it automatically using this function
    #
    # HOW FASTAPI USES IT:
    #   @app.get("/users")
    #   def get_users(db: Session = Depends(get_db)):  # ← FastAPI calls get_db()
    #       ...
    
    db = SessionLocal()
    # WHAT: Create a NEW session
    # WHY: Each request gets its own session
    # 
    # WHY NOT REUSE SESSIONS?
    #   - Isolation: Requests don't interfere with each other
    #   - Safety: If one request fails, others aren't affected
    #   - Clean: Each request starts fresh
    
    try:
        # WHAT: Start a try block
        # WHY: To ensure we ALWAYS close the session
        #      Even if an error happens!
        
        yield db
        # WHAT: Give the session to whoever called get_db()
        # WHY YIELD, NOT RETURN?
        #   - return: "Here's the session" (we're done)
        #   - yield:  "Here's the session, use it, I'll wait"
        # 
        # HOW YIELD WORKS:
        #   1. FastAPI calls get_db()
        #   2. get_db() creates session
        #   3. yield gives the session to FastAPI
        #   4. FastAPI runs the endpoint using the session
        #   5. When endpoint finishes, code continues after yield
        #   6. finally block runs (closes session)
        #
        # REAL-WORLD ANALOGY:
        #   - return = "Here are the keys" (you leave)
        #   - yield  = "Here are the keys, use the car, I'll wait to lock it after"
        
    finally:
        # WHAT: Runs ALWAYS - even if there's an error
        # WHY: To ensure the session is always closed
        #      Otherwise we'd have "zombie" connections
        
        db.close()
        # WHAT: Close the session
        # WHY: Free up resources
        #      Return the connection to the pool
        # 
        # WHAT HAPPENS IF WE DON'T CLOSE:
        #   - Connections pile up
        #   - Database runs out of available connections
        #   - App crashes eventually