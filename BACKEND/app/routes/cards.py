
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CreditCard, UserBadge
from app.schemas import CreditCardCreate, CreditCardResponse
from app.auth import get_current_user

router = APIRouter(prefix="/cards", tags=["cards"])

@router.get("/", response_model=List[CreditCardResponse])
def get_cards(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True
    ).all()
    return cards

@router.post("/", response_model=CreditCardResponse)
def create_card(
    card_data: CreditCardCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_card = CreditCard(
        user_id=current_user.id,
        card_name=card_data.card_name,
        last_four=card_data.last_four,
        credit_limit=card_data.credit_limit,
        current_balance=card_data.current_balance,
        apr=card_data.apr,
        due_day=card_data.due_day
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    # Check for "First Card" badge
    card_count = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id
    ).count()
    
    if card_count == 1:
        badge = UserBadge(
            user_id=current_user.id,
            badge_name="First Card",
            badge_icon="💳",
            description="Added your first credit card!"
        )
        db.add(badge)
        current_user.xp += 20
        db.commit()
    
    return new_card
