# ============================================================
# app/schemas.py
#
# PURPOSE: Define data validation for API requests and responses
#          - Validate incoming data (from users)
#          - Format outgoing data (to users)
#          - Auto-generate API documentation
#
# KEY CONCEPT: Pydantic BaseModel
#   - Validates data automatically
#   - Converts types (e.g., string "5" to int 5)
#   - Gives clear error messages
# ============================================================


# ============================================================
# SECTION 1: IMPORTS
# ============================================================

from pydantic import BaseModel, EmailStr
# BaseModel     → Base class for all schemas
#                 Provides validation and serialization
# EmailStr      → Special string type that validates email format
#                 Raises error if email is invalid

from typing import Optional, List
# Optional      → Field can be None or missing
#                 Optional[str] = str or None
# List          → A list of items
#                 List[dict] = list of dictionaries

from datetime import datetime
# datetime      → Python's datetime type
#                 Used for timestamps in responses
#                 Format: 2026-09-11T14:30:00


# ============================================================
# SECTION 2: AUTH SCHEMAS
# ============================================================
# Schemas for user registration, login, and authentication
# ============================================================


# ------------------------------------------------------------
# USER CREATE - For Registration
# ------------------------------------------------------------
# What user sends when registering a new account
# Only includes what user MUST provide

class UserCreate(BaseModel):
    """
    Registration request schema.
    
    Used when a new user signs up.
    All fields are required.
    """
    
    email: EmailStr
    # Email address - must be valid format
    # Pydantic auto-validates using EmailStr
    #  "not-an-email" → Validation error
    #  "user@example.com" → Accepted
    
    password: str
    # Plain text password - will be hashed before storing
    # NEVER stored as plain text in database
    # TODO: Add min_length=8, max_length=100 for production
    
    first_name: str
    # User's first name
    
    last_name: str
    # User's last name


# ------------------------------------------------------------
# USER LOGIN - For Login
# ------------------------------------------------------------
# What user sends when logging in
# Simpler than UserCreate - only email + password needed

class UserLogin(BaseModel):
    """
    Login request schema.
    
    Used when existing user logs in.
    """
    
    email: EmailStr
    # Email address - validates format
    
    password: str
    # Password - will be verified against stored hash


# ------------------------------------------------------------
# USER RESPONSE - What API Returns
# ------------------------------------------------------------
# What API sends back about a user
# IMPORTANT: NEVER includes password_hash!

class UserResponse(BaseModel):
    """
    User information returned by API.
    
    This is a "response" schema - it controls what data
    the API sends back to the client.
    
    Security note: password_hash is DELIBERATELY excluded.
    """
    
    id: int
    # User's unique database ID
    # Set automatically by PostgreSQL (autoincrement)
    # Example: 1, 2, 3, ...
    
    email: str
    # User's email
    # Note: We use str here (not EmailStr) because
    # the value is already in the database and validated
    
    first_name: str
    # User's first name
    
    last_name: str
    # User's last name
    
    xp: int
    # Experience points earned (gamification)
    # Example: 0, 50, 150
    
    level: int
    # Current user level (gamification)
    # Formula: floor(xp / 100) + 1
    # Example: 1, 2, 3
    
    class Config:
        from_attributes = True
        # Enables reading from SQLAlchemy models
        # 
        # WITHOUT this:
        #   user = db.query(User).first()
        #   return user  # ❌ FastAPI doesn't know how to convert
        #
        # WITH this:
        #   user = db.query(User).first()
        #   return user  # ✅ FastAPI converts to JSON
        #
        # (Previously called "orm_mode" in Pydantic v1)
        # (Renamed to "from_attributes" in Pydantic v2)


# ------------------------------------------------------------
# TOKEN RESPONSE - For Login/Register
# ------------------------------------------------------------
# What API returns after successful login/register
# Contains JWT token + user info

class TokenResponse(BaseModel):
    """
    Authentication response schema.
    
    Returned after successful registration or login.
    Contains the JWT token the client uses for future requests.
    """
    
    access_token: str
    # JWT token for authentication
    # Client stores this and sends in future requests
    # Format: "eyJhbGciOiJIUzI1NiIs..."
    # 
    # HOW TO USE IN FRONTEND:
    #   localStorage.setItem('token', response.access_token)
    #   
    # HOW TO USE IN API CALLS:
    #   headers: { Authorization: `Bearer ${token}` }
    
    token_type: str = "bearer"
    # Token type - always "bearer" for JWT
    # OAuth2 standard value
    # Client includes it in header: "Bearer eyJhbG..."
    
    user: UserResponse
    # User information (nested schema!)
    # This is a Pydantic schema inside another Pydantic schema


# ============================================================
# SECTION 3: CARD SCHEMAS
# ============================================================
# Schemas for credit card management
# ============================================================


# ------------------------------------------------------------
# CREDIT CARD CREATE - For Adding a Card
# ------------------------------------------------------------
# What user sends when adding a new credit card

class CreditCardCreate(BaseModel):
    """
    Credit card creation request schema.
    
    Used when user adds a new credit card to their account.
    """
    
    card_name: str
    # Name of the card (user's chosen label)
    # Example: "Chase Sapphire", "Amex Gold", "Discover It"
    
    last_four: str
    # Last 4 digits of the card number
    # Type: str (NOT int!) to preserve leading zeros
    # Example: "1234", "0123"
    # 
    # WHY STRING:
    #   If Integer: "0123" → 123 (loses leading zero)
    #   If String:  "0123" → "0123" (preserved)
    
    credit_limit: float
    # Maximum spending limit on the card
    # Type: float for decimal precision
    # Example: 5000.0, 10000.50
    
    current_balance: Optional[float] = 0
    # Current outstanding balance (optional)
    # Defaults to 0 if not provided
    # 
    # WHAT "Optional[float] = 0" MEANS:
    #   - Optional[float] → Can be float OR None
    #   - = 0 → Default value is 0
    #   
    # EXAMPLES:
    #   {"current_balance": 2000} → Uses 2000
    #   {} (omitted) → Uses 0
    #   {"current_balance": null} → Uses 0
    
    apr: float
    # Annual Percentage Rate (interest rate)
    # Type: float (decimal percentage)
    # Example: 22.99 (means 22.99%)
    
    due_day: int
    # Day of month payment is due (1-31)
    # Example: 15 (15th of every month)


# ------------------------------------------------------------
# CREDIT CARD RESPONSE - What API Returns
# ------------------------------------------------------------
# What API sends back for a credit card

class CreditCardResponse(BaseModel):
    """
    Credit card information returned by API.
    
    Includes all fields the frontend needs to display a card.
    """
    
    id: int
    # Unique database ID (assigned by PostgreSQL)
    
    card_name: str
    # Name of the card
    
    last_four: str
    # Last 4 digits (as string)
    
    credit_limit: float
    # Maximum spending limit
    
    current_balance: float
    # Current outstanding balance
    # Note: Not Optional here - always has a value in DB
    
    apr: float
    # Annual Percentage Rate
    
    due_day: int
    # Payment due day of month
    
    is_active: bool
    # Whether the card is active
    # False = soft-deleted (hidden but not removed)
    
    class Config:
        from_attributes = True
        # Enable reading from SQLAlchemy model


# ============================================================
# SECTION 4: PAYMENT SCHEMAS
# ============================================================
# Schemas for payment tracking
# ============================================================


# ------------------------------------------------------------
# PAYMENT CREATE - For Logging a Payment
# ------------------------------------------------------------
# What user sends when logging a payment

class PaymentCreate(BaseModel):
    """
    Payment creation request schema.
    
    Very simple - only 2 fields!
    Other fields (date, xp) are auto-generated.
    """
    
    card_id: int
    # ID of the card being paid
    # References CreditCard.id in database
    # 
    # WHY card_id AND NOT card_name:
    #   IDs are unique and efficient
    #   Names could change or be duplicated
    
    amount: float
    # Amount paid
    # Example: 200.00, 500.50
    # 
    # VALIDATION IN ENDPOINT:
    #   amount must be > 0
    #   amount must be <= current_balance


# ------------------------------------------------------------
# PAYMENT RESPONSE - What API Returns
# ------------------------------------------------------------
# What API sends back about a payment

class PaymentResponse(BaseModel):
    """
    Payment information returned by API.
    
    Contains fields auto-generated by server:
    - id: assigned by database
    - date: auto-set to current time
    - xp_earned: auto-calculated based on amount
    """
    
    id: int
    # Unique database ID
    
    card_id: int
    # Which card was paid
    
    amount: float
    # Amount paid
    
    date: datetime
    # When the payment was made
    # Auto-set by database (server_default=func.now())
    # Format: 2026-09-11T14:30:00Z
    
    xp_earned: int
    # XP earned from this payment
    # Auto-calculated: max(5, int(amount / 10))
    # Example: $200 payment → 20 XP
    
    class Config:
        from_attributes = True
        # Enable reading from SQLAlchemy model


# ============================================================
# SECTION 5: DASHBOARD SCHEMA
# ============================================================
# Schema for the user dashboard summary
# ============================================================

class DashboardResponse(BaseModel):
    """
    Dashboard summary response.
    
    This is a READ-ONLY schema - no "Create" version exists
    because dashboards are calculated, not created.
    
    All values are computed from existing data.
    """
    
    # ==================== FINANCIAL SUMMARY ====================
    total_debt: float
    # Sum of all card balances
    # Formula: SUM(credit_cards.current_balance)
    # Example: 2500.00
    
    total_limit: float
    # Sum of all credit limits
    # Formula: SUM(credit_cards.credit_limit)
    # Example: 10000.00
    
    available_credit: float
    # Total limit minus total debt
    # Formula: total_limit - total_debt
    # Example: 7500.00
    
    cards_count: int
    # Number of active cards
    # Example: 3
    
    # ==================== GAMIFICATION ====================
    level: int
    # User's current level
    # Example: 2
    
    xp: int
    # Total XP earned
    # Example: 150
    
    badges: List[dict]
    # List of earned badges
    # Format: [{"name": "First Card", "icon": "💳"}]
    # 
    # WHY List[dict] AND NOT List[BadgeResponse]:
    #   Simpler - we only need name and icon
    #   Could create a BadgeResponse schema for more structure
    
    # ==================== RECENT ACTIVITY ====================
    recent_payments: List[dict]
    # Last 10 payments
    # Format: [
    #   {
    #     "amount": 200.0,
    #     "date": "2026-09-11T14:30:00",
    #     "card_name": "Chase Sapphire",
    #     "last_four": "1234",
    #     "xp_earned": 20
    #   }
    # ]
    
    # ==================== PAYOFF SIMULATOR ====================
    payoff_months: Optional[int] = None
    # Months to pay off debt (with $200/month)
    # Optional because:
    #   - If no debt: doesn't apply
    #   - If payment too low: infinite (never pays off)
    # 
    # EXAMPLES:
    #   12 → 12 months
    #   None → No debt OR payment too low
    
    total_interest: Optional[float] = None
    # Total interest to be paid
    # Optional for same reasons
    # Example: 245.67


# ============================================================
# SCHEMA SUMMARY - Cheat Sheet
# ============================================================
#
# NAMING CONVENTION:
#   XCreate   → Input schema (what user sends)
#   XResponse → Output schema (what API returns)
#   X         → Sometimes used for special schemas
#
# FIELD TYPES:
#   str       → Text (plain)
#   EmailStr  → Validated email
#   int       → Whole number
#   float     → Decimal number
#   bool      → True/False
#   datetime  → Date and time
#   Optional[T] → T or None
#   List[T]   → List of T
#
# CONFIG OPTIONS:
#   from_attributes = True → Read from SQLAlchemy models
#   json_schema_extra       → Add example values
#   str_strip_whitespace    → Trim whitespace
#
# VALIDATION EXAMPLES:
#   email: EmailStr                          → Validates email
#   password: str = Field(min_length=8)      → Min length
#   age: int = Field(ge=0, le=150)           → Range check
#   name: str = Field(pattern="^[A-Za-z]+$") → Regex pattern
#
# ============================================================


# ============================================================
# HOW TO USE THESE SCHEMAS
# ============================================================
#
# IN ENDPOINTS:
#   @app.post("/register")
#   def register(user_data: UserCreate):     # ← Input schema
#       # user_data is validated automatically
#       return TokenResponse(...)            # ← Output schema
#
# IN FASTAPI AUTO-DOCS:
#   Swagger UI shows all schemas automatically
#   Try sending bad data → see validation errors
#
# IN TESTS:
#   user = UserCreate(
#       email="test@example.com",
#       password="password123",
#       first_name="John",
#       last_name="Doe"
#   )
#   # Pydantic validates everything
#
# ============================================================