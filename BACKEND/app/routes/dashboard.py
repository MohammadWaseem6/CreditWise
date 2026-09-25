
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CreditCard, Payment, UserBadge
from app.auth import get_current_user   # ✅ CORRECT!
import math

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
def get_dashboard(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all cards
    cards = db.query(CreditCard).filter(CreditCard.user_id == current_user.id).all()
    
    # Get recent payments
    recent_payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.date.desc()).limit(10).all()
    
    # Get badges
    badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    
    # Calculate totals
    total_debt = sum(c.current_balance for c in cards)
    total_limit = sum(c.credit_limit for c in cards)
    available_credit = total_limit - total_debt
    
    # Payoff simulator
    monthly_payment = 200
    payoff_months = None
    total_interest = 0
    
    if total_debt > 0 and monthly_payment > 0:
        avg_apr = sum(c.apr for c in cards) / len(cards) if cards else 0
        monthly_rate = (avg_apr / 100) / 12
        
        if monthly_payment > total_debt * monthly_rate:
            payoff_months = math.ceil(
                -math.log(1 - (monthly_rate * total_debt) / monthly_payment) / 
                math.log(1 + monthly_rate)
            )
            total_interest = round((payoff_months * monthly_payment) - total_debt, 2)
    
    return {
        "total_debt": total_debt,
        "total_limit": total_limit,
        "available_credit": available_credit,
        "cards_count": len(cards),
        "level": current_user.level,
        "xp": current_user.xp,
        "badges": [{"name": b.badge_name, "icon": b.badge_icon} for b in badges],
        "recent_payments": [{
            "amount": p.amount,
            "date": p.date.isoformat(),
            "card_name": p.card.card_name,
            "last_four": p.card.last_four,
            "xp_earned": p.xp_earned
        } for p in recent_payments],
        "payoff_months": payoff_months,
        "total_interest": total_interest
    }
