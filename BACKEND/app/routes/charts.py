from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CreditCard, Payment
from app.auth import get_current_user
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/charts", tags=["charts"])


@router.get("/")
def get_chart_data(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True,
    ).all()

    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.date.asc()).all()

    card_distribution = [
        {
            "name": c.card_name,
            "last_four": c.last_four,
            "balance": round(c.current_balance, 2),
            "limit": round(c.credit_limit, 2),
        }
        for c in cards
    ]

    monthly = defaultdict(lambda: {"amount": 0.0, "count": 0})
    for p in payments:
        key = p.date.strftime("%Y-%m")
        monthly[key]["amount"] += p.amount
        monthly[key]["count"] += 1

    now = datetime.utcnow()
    monthly_payments = []
    for i in range(5, -1, -1):
        month_date = now - timedelta(days=30 * i)
        key = month_date.strftime("%Y-%m")
        label = month_date.strftime("%b %Y")
        data = monthly.get(key, {"amount": 0.0, "count": 0})
        monthly_payments.append({
            "month": label,
            "amount": round(data["amount"], 2),
            "count": data["count"],
        })

    debt_trend = []
    if payments:
        total_debt_now = sum(c.current_balance for c in cards)
        total_paid = sum(p.amount for p in payments)
        original_debt = total_debt_now + total_paid

        running = original_debt
        debt_trend.append({
            "date": payments[0].date.strftime("%b %d"),
            "debt": round(running, 2),
        })
        for p in payments:
            running -= p.amount
            debt_trend.append({
                "date": p.date.strftime("%b %d"),
                "debt": round(max(running, 0), 2),
            })

    return {
        "monthly_payments": monthly_payments,
        "card_distribution": card_distribution,
        "debt_trend": debt_trend,
        "totals": {
            "total_debt": round(sum(c.current_balance for c in cards), 2),
            "total_paid": round(sum(p.amount for p in payments), 2),
            "payment_count": len(payments),
        },
    }