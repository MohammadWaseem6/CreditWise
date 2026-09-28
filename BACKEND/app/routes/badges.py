from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserBadge, CreditCard, Payment
from app.auth import get_current_user

router = APIRouter(prefix="/badges", tags=["badges"])


BADGE_CATALOG = [
    {
        "name": "First Card",
        "icon": "CreditCard",
        "color": "from-blue-500 to-cyan-500",
        "description": "Added your first credit card",
        "requirement": "Add 1 credit card",
    },
    {
        "name": "First Payment",
        "icon": "Send",
        "color": "from-green-500 to-emerald-500",
        "description": "Logged your first payment",
        "requirement": "Log 1 payment",
    },
    {
        "name": "Payment Streak",
        "icon": "Flame",
        "color": "from-orange-500 to-red-500",
        "description": "Logged 5 payments",
        "requirement": "Log 5 payments",
    },
    {
        "name": "Debt Destroyer",
        "icon": "Swords",
        "color": "from-purple-500 to-pink-500",
        "description": "Paid off 50% of total debt",
        "requirement": "Pay off 50% of credit limit",
    },
    {
        "name": "Saver",
        "icon": "PiggyBank",
        "color": "from-pink-500 to-rose-500",
        "description": "Paid off $1,000 total",
        "requirement": "Pay $1,000 in total",
    },
    {
        "name": "Level 5",
        "icon": "Star",
        "color": "from-yellow-500 to-amber-500",
        "description": "Reached Level 5",
        "requirement": "Reach Level 5",
    },
    {
        "name": "Level 10",
        "icon": "Crown",
        "color": "from-yellow-400 to-orange-500",
        "description": "Reached Level 10",
        "requirement": "Reach Level 10",
    },
    {
        "name": "Debt Free",
        "icon": "PartyPopper",
        "color": "from-emerald-500 to-teal-500",
        "description": "Paid off ALL your cards",
        "requirement": "Have $0 balance on all cards",
    },
    {
        "name": "Big Spender",
        "icon": "TrendingUp",
        "color": "from-indigo-500 to-blue-500",
        "description": "Credit limit over $10,000",
        "requirement": "Total credit limit > $10,000",
    },
    {
        "name": "Card Collector",
        "icon": "Layers",
        "color": "from-violet-500 to-purple-500",
        "description": "Added 3 or more cards",
        "requirement": "Add 3 credit cards",
    },
]


@router.get("/")
def get_badges(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    earned = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).all()
    earned_names = {b.badge_name for b in earned}

    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).all()
    total_payments = len(payments)
    total_paid_amount = sum(p.amount for p in payments)

    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True,
    ).all()
    total_limit = sum(c.credit_limit for c in cards)
    total_debt = sum(c.current_balance for c in cards)
    cards_count = len(cards)

    new_badges = []

    if total_payments >= 1 and "First Payment" not in earned_names:
        new_badges.append("First Payment")

    if total_payments >= 5 and "Payment Streak" not in earned_names:
        new_badges.append("Payment Streak")

    if total_paid_amount >= 1000 and "Saver" not in earned_names:
        new_badges.append("Saver")

    if current_user.level >= 5 and "Level 5" not in earned_names:
        new_badges.append("Level 5")

    if current_user.level >= 10 and "Level 10" not in earned_names:
        new_badges.append("Level 10")

    if total_debt == 0 and cards_count > 0 and "Debt Free" not in earned_names:
        new_badges.append("Debt Free")

    if total_limit >= 10000 and "Big Spender" not in earned_names:
        new_badges.append("Big Spender")

    if cards_count >= 3 and "Card Collector" not in earned_names:
        new_badges.append("Card Collector")

    if cards_count > 0:
        total_paid = total_limit - total_debt
        if total_paid >= total_limit * 0.5 and "Debt Destroyer" not in earned_names:
            new_badges.append("Debt Destroyer")

    if new_badges:
        for name in new_badges:
            badge_info = next(
                (b for b in BADGE_CATALOG if b["name"] == name),
                None,
            )
            if badge_info:
                badge = UserBadge(
                    user_id=current_user.id,
                    badge_name=name,
                    badge_icon=badge_info["icon"],
                    description=badge_info["description"],
                )
                db.add(badge)
        db.commit()

        earned = db.query(UserBadge).filter(
            UserBadge.user_id == current_user.id
        ).all()
        earned_names = {b.badge_name for b in earned}

    def get_badge_color(name: str) -> str:
        info = next((b for b in BADGE_CATALOG if b["name"] == name), None)
        return info["color"] if info else "from-gray-500 to-gray-600"

    earned_list = [
        {
            "name": b.badge_name,
            "icon": b.badge_icon,
            "color": get_badge_color(b.badge_name),
            "description": b.description,
            "earned_at": b.earned_at.isoformat(),
        }
        for b in earned
    ]

    available_list = [
        {
            "name": badge["name"],
            "icon": badge["icon"],
            "color": badge["color"],
            "description": badge["description"],
            "requirement": badge["requirement"],
        }
        for badge in BADGE_CATALOG
        if badge["name"] not in earned_names
    ]

    return {
        "earned": earned_list,
        "available": available_list,
        "total_earned": len(earned_list),
        "total_badges": len(BADGE_CATALOG),
        "newly_awarded": new_badges,
    }