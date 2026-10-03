
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CreditCard, UserBadge
from app.schemas import CreditCardCreate, CreditCardResponse, CreditCardUpdate
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
    cardholder_name=card_data.cardholder_name,   
    card_number=card_data.card_number,
    last_four=card_data.last_four,
    credit_limit=card_data.credit_limit,
    current_balance=card_data.current_balance,
    apr=card_data.apr,
    due_day=card_data.due_day,
    expiry_month=card_data.expiry_month,
    expiry_year=card_data.expiry_year,
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

@router.put("/{card_id}", response_model=CreditCardResponse)
def update_card(
    card_id: int,
    card_data: CreditCardUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id,
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    update_data = card_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)
    return card

@router.delete("/{card_id}")
def delete_card(
    card_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id,
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.is_active = False
    db.commit()
    return {"message": "Card deleted successfully"}