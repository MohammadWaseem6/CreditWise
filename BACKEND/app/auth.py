from datetime import datetime, timedelta  # datetime = current time, timedelta = add/subtract time
from jose import jwt, JWTError  # jwt = create/decode tokens, JWTError = exception for bad tokens
from passlib.context import CryptContext  # CryptContext = password hasher (bcrypt wrapper)
from fastapi import HTTPException, Depends  # HTTPException = raise errors, Depends = dependency injection
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # HTTPBearer = read Bearer token from header
from sqlalchemy.orm import Session  # Session = type hint for DB session
from app.database import get_db  # get_db = function that gives us a DB session
from app.models import User  # User = the User model to query from DB

# CONFIG
SECRET_KEY = "creditwise-super-secret-key-change-in-production"  # Key used to sign JWT tokens (keep secret!)
ALGORITHM = "HS256"  # Signing algorithm (HMAC + SHA-256)
TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours = 60 min × 24

# PASSWORD HASHING
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Create bcrypt password hasher

def hash_password(password: str) -> str:  # Takes plain password, returns hash
    """Convert plain password into hash (max 72 bytes for bcrypt)"""
    return pwd_context.hash(password[:72])  # Truncate to 72 bytes (bcrypt limit), then hash

def verify_password(plain: str, hashed: str) -> bool:  # Takes plain + hash, returns True/False
    """Check if plain password matches stored hash"""
    return pwd_context.verify(plain[:72], hashed)  # Truncate, then compare with stored hash

# JWT TOKENS
def create_token(user_id: int) -> str:  # Takes user ID, returns JWT string
    """Create JWT token for a user"""
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)  # Calculate expiry: now + 24h
    payload = {"sub": str(user_id), "exp": expire}  # sub = subject (user ID as string), exp = expiry
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)  # Sign + encode payload into JWT string

# GET CURRENT USER
security = HTTPBearer()  # Extracts "Bearer xxx" token from Authorization header

def get_current_user(  # Reads token from request, returns the User object
    credentials: HTTPAuthorizationCredentials = Depends(security),  # FastAPI injects extracted token here
    db: Session = Depends(get_db)  # FastAPI injects DB session here
) -> User:  # Returns a User object
    """Get the logged-in user from JWT token"""
    try:  # Try decoding the token (may fail)
        token = credentials.credentials  # Get the raw JWT string from credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # Verify + decode token
        user_id = int(payload.get("sub"))  # Extract user ID from "sub", convert string to int
    except (JWTError, ValueError, TypeError):  # Catch: bad signature, expired, invalid int
        raise HTTPException(status_code=401, detail="Invalid token")  # Return 401 Unauthorized
    
    user = db.query(User).filter(User.id == user_id).first()  # Look up user by ID in database
    if not user:  # If user doesn't exist (token valid but user deleted)
        raise HTTPException(status_code=401, detail="User not found")  # Return 401
    return user  # Return the User object to the endpoint