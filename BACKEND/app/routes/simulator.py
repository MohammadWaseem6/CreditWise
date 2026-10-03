from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CreditCard
from app.auth import get_current_user
import math
from datetime import datetime, timedelta

router = APIRouter(prefix="/simulator", tags=["simulator"])


def calculate_payoff(balance: float, apr: float, monthly_payment: float):
    if balance <= 0:
        return {"months": 0, "total_interest": 0, "total_paid": 0}

    monthly_rate = (apr / 100) / 12

    if monthly_rate == 0:
        months = math.ceil(balance / monthly_payment)
        return {
            "months": months,
            "total_interest": 0,
            "total_paid": balance,
        }

    if monthly_payment <= balance * monthly_rate:
        return {
            "months": None,
            "total_interest": None,
            "total_paid": None,
            "warning": "Payment too low - never pays off",
        }

    months = math.ceil(
        -math.log(1 - (monthly_rate * balance) / monthly_payment)
        / math.log(1 + monthly_rate)
    )

    total_paid = months * monthly_payment
    total_interest = total_paid - balance

    return {
        "months": months,
        "total_interest": round(total_interest, 2),
        "total_paid": round(total_paid, 2),
    }


@router.get("/")
def simulate(
    monthly_payment: float = Query(..., gt=0),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True,
    ).all()

    if not cards:
        return {
            "total_debt": 0,
            "cards": [],
            "total_months": 0,
            "total_interest": 0,
            "total_paid": 0,
            "payoff_date": None,
            "minimum_payment": 0,
            "minimum_scenario": None,
            "savings": 0,
        }

    total_debt = sum(c.current_balance for c in cards)
    total_limit = sum(c.credit_limit for c in cards)

    total_monthly = sum(
        min(c.credit_limit, c.current_balance) * (c.apr / 100) / 12
        for c in cards
    ) if total_debt > 0 else 0

    card_simulations = []
    total_months = 0
    total_interest = 0

    for card in cards:
        if card.current_balance <= 0:
            continue

        card_share = card.current_balance / total_debt if total_debt > 0 else 0
        card_payment = monthly_payment * card_share

        result = calculate_payoff(
            card.current_balance,
            card.apr,
            card_payment,
        )

        card_simulations.append({
            "card_name": card.card_name,
            "last_four": card.last_four,
            "balance": card.current_balance,
            "apr": card.apr,
            "payment": round(card_payment, 2),
            "months": result["months"],
            "interest": result["total_interest"],
            "paid": result["total_paid"],
        })

        if result["months"] and result["months"] > total_months:
            total_months = result["months"]

        if result["total_interest"]:
            total_interest += result["total_interest"]

    payoff_date = None
    if total_months > 0:
        payoff_date = (datetime.now() + timedelta(days=total_months * 30)).strftime("%B %Y")

    minimum_payment = max(total_debt * 0.02, 25) if total_debt > 0 else 0
    minimum_scenario = None
    savings = 0

    if minimum_payment > 0 and total_debt > 0:
        avg_apr = sum(c.apr for c in cards) / len(cards) if cards else 0
        min_result = calculate_payoff(total_debt, avg_apr, minimum_payment)

        if min_result["months"] and min_result["total_interest"] is not None:
            minimum_scenario = {
                "payment": round(minimum_payment, 2),
                "months": min_result["months"],
                "interest": min_result["total_interest"],
                "paid": min_result["total_paid"],
            }
            if total_interest:
                savings = round(min_result["total_interest"] - total_interest, 2)

    return {
        "total_debt": round(total_debt, 2),
        "cards": card_simulations,
        "total_months": total_months,
        "total_interest": round(total_interest, 2),
        "total_paid": round(total_debt + total_interest, 2),
        "payoff_date": payoff_date,
        "minimum_payment": round(minimum_payment, 2),
        "minimum_scenario": minimum_scenario,
        "savings": savings,
    }