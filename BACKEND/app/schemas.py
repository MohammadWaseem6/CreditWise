
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ==================== AUTH SCHEMAS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    xp: int
    level: int

    class Config:
        from_attributes = True  # Fixed! (was orm_mode)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==================== CARD SCHEMAS ====================

class CreditCardCreate(BaseModel):
    card_name: str
    last_four: str
    credit_limit: float
    current_balance: Optional[float] = 0
    apr: float
    due_day: int

class CreditCardResponse(BaseModel):
    id: int
    card_name: str
    last_four: str
    credit_limit: float
    current_balance: float
    apr: float
    due_day: int
    is_active: bool

    class Config:
        from_attributes = True  # Fixed!

# ==================== PAYMENT SCHEMAS ====================

class PaymentCreate(BaseModel):
    card_id: int
    amount: float

class PaymentResponse(BaseModel):
    id: int
    card_id: int
    amount: float
    date: datetime
    xp_earned: int

    class Config:
        from_attributes = True  # Fixed!

# ==================== DASHBOARD SCHEMAS ====================

class DashboardResponse(BaseModel):
    total_debt: float
    total_limit: float
    available_credit: float
    cards_count: int
    level: int
    xp: int
    badges: List[dict]
    recent_payments: List[dict]
    payoff_months: Optional[int] = None
    total_interest: Optional[float] = None
