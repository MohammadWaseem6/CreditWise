# ============================================================
# app/models.py
#
# PURPOSE: Define database tables using SQLAlchemy
#          Each class = one table
#          Each Column = one column in that table
# ============================================================


# ============================================================
# SECTION 1: IMPORTS
# ============================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
# Column        → Define a column in a table
# Integer       → Whole numbers (1, 2, 3)
# String        → Text ("Hello", "John")
# Float         → Decimal numbers (22.99, 5000.50)
# DateTime      → Date and time (2026-09-11 14:30:00)
# Boolean       → True or False
# ForeignKey    → Link to another table's column

from sqlalchemy.orm import relationship
# relationship  → Python-level connection between tables
#                 Lets you do: user.credit_cards
#                 Instead of: db.query(CreditCard).filter(...)

from sqlalchemy.sql import func
# func          → SQL functions like now(), count(), sum()
#                 Used for server_default=func.now()

from .database import Base
# Base          → Our base class from database.py
#                 Every model inherits from this
#                 SQLAlchemy knows "this is a table"


# ============================================================
# SECTION 2: USER MODEL
# ============================================================
# Represents: One row = one user
# Table name: users
# Purpose:    Store user account info + gamification stats

class User(Base):
    # (Base) makes this a database table!
    
    __tablename__ = "users"
    # Actual table name in PostgreSQL
    # Python class: User (PascalCase)
    # Database table: users (snake_case)
    
    # ==================== PRIMARY KEY ====================
    id = Column(Integer, primary_key=True, index=True)
    # id            → Column name
    # Integer       → Whole number type
    # primary_key   → Unique identifier for each row
    # index         → Create an index for fast lookups
    
    # ==================== USER INFO ====================
    email = Column(String, unique=True, index=True)
    # email         → Column name
    # String        → Text type
    # unique        → No two users can have same email
    # index         → Fast search by email
    
    password_hash = Column(String)
    # password_hash → HASHED password (never plain text!)
    # String        → Text type
    # Example: "$2b$12$K8y..." (bcrypt hash)
    
    first_name = Column(String)
    # first_name    → User's first name
    # String        → Text type
    
    last_name = Column(String)
    # last_name     → User's last name
    # String        → Text type
    
    # ==================== GAMIFICATION ====================
    xp = Column(Integer, default=0)
    # xp            → Experience points earned
    # Integer       → Whole number
    # default=0     → Starts at 0 if not provided
    
    level = Column(Integer, default=1)
    # level         → Current user level
    # Integer       → Whole number
    # default=1     → Every user starts at level 1
    
    # ==================== TIMESTAMP ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # created_at    → When user was created
    # DateTime      → Date and time type
    # timezone=True → Store with timezone info
    # server_default=func.now() → DATABASE sets the time automatically
    
    # ==================== RELATIONSHIPS ====================
    # These are NOT database columns!
    # They're Python-level shortcuts to access related data
    
    credit_cards = relationship("CreditCard", back_populates="user")
    # credit_cards  → Access via user.credit_cards
    # "CreditCard"  → The related class (in quotes, class not defined yet)
    # back_populates → The field on CreditCard that points back to User
    
    payments = relationship("Payment", back_populates="user")
    # payments      → Access via user.payments
    # Gets all payments made by this user
    
    badges = relationship("UserBadge", back_populates="user")
    # badges        → Access via user.badges
    # Gets all badges earned by this user


# ============================================================
# SECTION 3: CREDIT CARD MODEL
# ============================================================
# Represents: One row = one credit card
# Table name: credit_cards
# Purpose:    Store credit card details + balance

class CreditCard(Base):
    __tablename__ = "credit_cards"
    
    # ==================== PRIMARY KEY ====================
    id = Column(Integer, primary_key=True, index=True)
    # Unique ID for each card
    
    # ==================== FOREIGN KEY (Link to User) ====================
    user_id = Column(Integer, ForeignKey("users.id"))
    # user_id       → Column name (reference to users.id)
    # Integer       → Same type as users.id
    # ForeignKey    → Links to users table's id column
    # 
    # Example: If user_id = 1, this card belongs to user with id=1
    
    # ==================== CARD INFO ====================
    card_name = Column(String)
    # card_name     → Name of card (e.g., "Chase Sapphire")
    # String        → Text type
    
    last_four = Column(String)
    # last_four     → Last 4 digits (e.g., "1234")
    # String        → Text type (NOT Integer!)
    # Why String?   → To preserve leading zeros ("0123")
    
    # ==================== FINANCIAL INFO ====================
    credit_limit = Column(Float)
    # credit_limit  → Max spending limit
    # Float         → Decimal type (5000.00)
    
    current_balance = Column(Float, default=0)
    # current_balance → Current amount owed
    # Float          → Decimal type
    # default=0      → Starts at 0 for new cards
    
    apr = Column(Float)
    # apr           → Annual Percentage Rate (interest)
    # Float         → Decimal type (22.99)
    
    # ==================== PAYMENT INFO ====================
    due_day = Column(Integer)
    # due_day       → Day of month payment is due
    # Integer       → 1-31
    
    rewards_percent = Column(Float, default=0)
    # rewards_percent → Cashback percentage
    # Float          → Decimal (1.5 = 1.5%)
    # default=0      → No rewards by default
    
    # ==================== STATUS ====================
    is_active = Column(Boolean, default=True)
    # is_active     → Is the card active?
    # Boolean       → True/False
    # default=True  → New cards are active
    # Why?          → For "soft delete" - hide but keep data
    
    # ==================== TIMESTAMP ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # When the card was added
    
    # ==================== RELATIONSHIPS ====================
    user = relationship("User", back_populates="credit_cards")
    # Access via: card.user
    # Returns: The User object who owns this card
    
    payments = relationship("Payment", back_populates="card")
    # Access via: card.payments
    # Returns: All payments made to this card


# ============================================================
# SECTION 4: PAYMENT MODEL
# ============================================================
# Represents: One row = one payment
# Table name: payments
# Purpose:    Track every payment made

class Payment(Base):
    __tablename__ = "payments"
    
    # ==================== PRIMARY KEY ====================
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== FOREIGN KEYS ====================
    user_id = Column(Integer, ForeignKey("users.id"))
    # Links to the user who made the payment
    
    card_id = Column(Integer, ForeignKey("credit_cards.id"))
    # Links to the card that was paid
    
    # ==================== PAYMENT INFO ====================
    amount = Column(Float)
    # amount        → How much was paid
    # Float         → Decimal (200.00)
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    # date          → When payment was made
    # Auto-set by database
    
    xp_earned = Column(Integer, default=10)
    # xp_earned     → XP gained from this payment
    # Integer       → Whole number
    # default=10    → Even small payments get XP
    
    # ==================== RELATIONSHIPS ====================
    user = relationship("User", back_populates="payments")
    # Access via: payment.user → Who made this payment
    
    card = relationship("CreditCard", back_populates="payments")
    # Access via: payment.card → Which card was paid


# ============================================================
# SECTION 5: USER BADGE MODEL
# ============================================================
# Represents: One row = one badge earned by a user
# Table name: user_badges
# Purpose:    Track gamification achievements

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    # ==================== PRIMARY KEY ====================
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== FOREIGN KEY ====================
    user_id = Column(Integer, ForeignKey("users.id"))
    # Links to the user who earned the badge
    
    # ==================== BADGE INFO ====================
    badge_name = Column(String)
    # badge_name    → Name (e.g., "First Card")
    
    badge_icon = Column(String)
    # badge_icon    → Emoji or icon (e.g., "💳")
    
    description = Column(String)
    # description   → What the badge is for
    
    # ==================== TIMESTAMP ====================
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    # When the badge was earned
    
    # ==================== RELATIONSHIP ====================
    user = relationship("User", back_populates="badges")
    # Access via: badge.user → Who earned this badge


# ============================================================
# RELATIONSHIP SUMMARY
# ============================================================
#
# User (1) ──── has many ──→ CreditCard (many)
#    │                              │
#    │                              │
#    │                              ↓
#    │                        has many
#    │                              │
#    │                              ↓
#    │                          Payment (many)
#    │
#    ├──── has many ──→ Payment (many)
#    │
#    └──── has many ──→ UserBadge (many)
#
# ============================================================


# ============================================================
# HOW TO USE THESE MODELS
# ============================================================
#
# CREATE:
#   user = User(email="test@example.com", ...)
#   db.add(user)
#   db.commit()
#
# READ:
#   user = db.query(User).filter(User.email == "test@example.com").first()
#
# UPDATE:
#   user.xp += 10
#   db.commit()
#
# DELETE:
#   db.delete(user)
#   db.commit()
#
# ACCESS RELATIONSHIPS:
#   user.credit_cards      → List of CreditCard objects
#   user.payments          → List of Payment objects
#   user.badges            → List of UserBadge objects
#   card.user              → The User who owns the card
#   payment.card           → The CreditCard that was paid
#
# ============================================================