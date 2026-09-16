from datetime import datetime, timedelta 
from jose import jwt,JWTError
from passlib.context import CryptContext
from fastapi import HTTPException ,Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

#CONFIG
SECRET_KEY="creditwise-super-secret-key-change-in-production"
ALGORITHM="HS256"
TOKEN_EXPIRY_MINUTES=60*24 #24HRS

#PASSWORD HASHING
def hash_password (password:str)->str:
      """Convert plain password into hash (max 72 bytes for bcrypt)"""
