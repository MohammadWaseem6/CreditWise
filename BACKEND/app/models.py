from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    credit_cards = relationship("CreditCard", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")

class CreditCard(Base):
    __tablename__ = "credit_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_name = Column(String)
    last_four = Column(String)
    credit_limit = Column(Float)
    current_balance = Column(Float, default=0)
    apr = Column(Float)
    due_day = Column(Integer)
    rewards_percent = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="credit_cards")
    payments = relationship("Payment", back_populates="card")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("credit_cards.id"))
    amount = Column(Float)
    date = Column(DateTime(timezone=True), server_default=func.now())
    xp_earned = Column(Integer, default=10)
    
    user = relationship("User", back_populates="payments")
    card = relationship("CreditCard", back_populates="payments")

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String)
    badge_icon = Column(String)
    description = Column(String)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="badges")