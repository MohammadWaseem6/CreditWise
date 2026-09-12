
# ============================================================
# app/routes/auth.py
# PURPOSE: Register and Login endpoints
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.auth import hash_password, verify_password, create_token,get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==================== REGISTER ====================
@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password
    hashed = hash_password(user_data.password)
    
    # 3. Create the user
    user = User(
        email=user_data.email,
        password_hash=hashed,
        first_name=user_data.first_name,
        last_name=user_data.last_name
    )
    
    # 4. Save to database
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 5. Create token
    token = create_token(user.id)
    
    # 6. Return response
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

# ==================== LOGIN ====================
@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 2. Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 3. Create token
    token = create_token(user.id)
    
    # 4. Return response
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

# ==================== GET ME ====================
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
