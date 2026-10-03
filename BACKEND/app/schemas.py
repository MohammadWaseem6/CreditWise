from pydantic import BaseModel,EmailStr
from typing import Optional,List
from datetime import datetime


# USER CREATE - For Registration

class UserCreate(BaseModel):
    email:EmailStr
    password:str
    first_name:str
    last_name:str
    
# USER LOGIN - For Login
class UserLogin(BaseModel):
    email:EmailStr
    password:str
        
# USER RESPONSE - What API Returns
class UserResponse(BaseModel):
    id:int
    email:str
    first_name:str
    last_name:str
    xp:int
    level:int
    
    class Config:
        from_attributes = True  
#Why class Config: from_attributes = True:
# Lets Pydantic read from SQLAlchemy objects
# user = db.query(User).first() → returns User SQLAlchemy object
# With from_attributes = True → Pydantic converts it to the schema automatically




# CREDIT CARD CREATE - For Adding a Card
class CreditCardCreate(BaseModel):
    card_name: str
    cardholder_name: Optional[str] = None
    card_number: Optional[str] = None
    last_four: str
    credit_limit: float
    current_balance: Optional[float] = 0
    apr: float
    due_day: int
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None

class CreditCardUpdate(BaseModel):
    card_name: Optional[str] = None
    cardholder_name: Optional[str] = None
    card_number: Optional[str] = None
    last_four: Optional[str] = None
    credit_limit: Optional[float] = None
    current_balance: Optional[float] = None
    apr: Optional[float] = None
    due_day: Optional[int] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
# CREDIT CARD RESPONSE - What API Returns
class CreditCardResponse(BaseModel):
    id: int
    card_name: str
    cardholder_name: Optional[str] = None
    card_number: Optional[str] = None
    last_four: str
    credit_limit: float
    current_balance: float
    apr: float
    due_day: int
    is_active: bool
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None

    class Config:
        from_attributes = True
# TOKEN RESPONSE - For Login/Register
class TokenResponse(BaseModel):
    access_token:str
    token_type:str ="bearer"
    user:UserResponse

# PAYMENT CREATE - For Logging a Payment
class PaymentCreate(BaseModel):
    card_id:int
    amount:float

# PAYMENT RESPONSE - What API Returns

class PaymentResponse(BaseModel):
    id:int
    card_id:int
    amount:float
    date:datetime
    xp_earned:int
    
    class Config:
        from_attributes = True
class DashboardResponse(BaseModel):
    #financial summary
    total_debt:float
    total_limit:float
    available_credit:float
    cards_count:int 
    
    # Gamification       
    level:int
    xp:int
    badges:List[dict]
    
    # Recent activity
    recent_payment:List[dict]
    
    # Payoff simulator
    payoff_months:Optional[int]=None
    total_interest:Optional[int]=None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str