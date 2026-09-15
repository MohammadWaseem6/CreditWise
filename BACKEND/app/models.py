# PURPOSE: Define database tables using SQLAlchemy
#          Each class = one table

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# USER MODEL


class User(Base):
    __tablename__ = "users"

    # primary key - unique identifier for each user
    id = Column(Integer, primary_key=True, index=True)

    # user's information
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)

    # gamification fields
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)

    # timestamps - auto set when user is created
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships - python level links to other tables
    credit_cards = relationship("CreditCard", back_populates="user")  # back_populates="user" = the field on CreditCard that points back to User
    payments = relationship("Payment", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    # Get user's cards (no manual query needed!)
    # user = db.query(User).first()
    # user.credit_cards      # Returns list of Card objects
    # user.payments          # Returns list of Payment objects
    # user.badges            # Returns list of UserBadge objects



# CREDIT CARD MODEL


class CreditCard(Base):
    __tablename__ = "credit_cards"

    # primary key - unique identifier for each card
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key - links this card to user
    user_id = Column(Integer, ForeignKey("users.id"))

    # card information
    card_name = Column(String)
    last_four = Column(String)

    # financial info
    credit_limit = Column(Float)
    current_balance = Column(Float, default=0)
    apr = Column(Float)
    due_day = Column(Integer)
    rewards_percent = Column(Float, default=0)

    # is active
    is_active = Column(Boolean, default=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="credit_cards")
    payments = relationship("Payment", back_populates="card")



# PAYMENT MODEL


class Payment(Base):
    __tablename__ = "payments"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys - links to user AND card
    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("credit_cards.id"))

    # Payment info
    amount = Column(Float)
    date = Column(DateTime(timezone=True), server_default=func.now())
    xp_earned = Column(Integer, default=10)

    # Relationships
    user = relationship("User", back_populates="payments")
    card = relationship("CreditCard", back_populates="payments")



# USER BADGE MODEL
# Represents: One achievement badge earned by a user
# Table name: user_badges


class UserBadge(Base):
    __tablename__ = "user_badges"

    # primary key
    id = Column(Integer, primary_key=True, index=True)

    # foreign key linked to user who earned the badge
    user_id = Column(Integer, ForeignKey("users.id"))

    # badge info
    badge_name = Column(String)
    badge_icon = Column(String)
    description = Column(String)

    # Timestamp
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="badges")