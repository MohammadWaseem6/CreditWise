
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CreditCard, Payment, UserBadge
from app.schemas import PaymentCreate
from app.routes.auth import get_current_user
import math

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/")
def log_payment(
    payment_data: PaymentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the card
    card = db.query(CreditCard).filter(
        CreditCard.id == payment_data.card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if payment_data.amount > card.current_balance:
        raise HTTPException(status_code=400, detail="Payment exceeds current balance")
    
    # Calculate XP: 10 XP per $100
    xp_earned = max(5, int(payment_data.amount / 10))
    
    # Update card balance
    card.current_balance -= payment_data.amount
    
    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        card_id=card.id,
        amount=payment_data.amount,
        xp_earned=xp_earned
    )
    db.add(payment)
    
    # Add XP to user
    current_user.xp += xp_earned
    
    # Check for level up
    new_level = math.floor(current_user.xp / 100) + 1
    if new_level > current_user.level:
        current_user.level = new_level
    
    db.commit()
    
    return {
        "message": "Payment logged successfully",
        "xp_earned": xp_earned,
        "new_balance": card.current_balance,
        "level": current_user.level
    }
# GET ALL PAYMENTS

@router.get("/")
def get_payments(
    card_id: int = None,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for the current user.
    Optional query param: card_id (filter by card)
    """
    query = db.query(Payment).filter(Payment.user_id == current_user.id)

    if card_id:
        query = query.filter(Payment.card_id == card_id)

    payments = query.order_by(Payment.date.desc()).limit(limit).all()

    # Calculate stats
    all_payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).all()

    total_paid = sum(p.amount for p in all_payments)
    total_count = len(all_payments)
    total_xp = sum(p.xp_earned for p in all_payments)
    avg_payment = total_paid / total_count if total_count > 0 else 0

    return {
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "date": p.date.isoformat(),
                "xp_earned": p.xp_earned,
                "card_id": p.card_id,
                "card_name": p.card.card_name if p.card else "Unknown",
                "last_four": p.card.last_four if p.card else "----",
            }
            for p in payments
        ],
        "stats": {
            "total_paid": round(total_paid, 2),
            "total_count": total_count,
            "total_xp": total_xp,
            "avg_payment": round(avg_payment, 2),
        },
    }