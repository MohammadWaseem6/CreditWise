from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import User
from app.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def mask_email(email: str) -> str:
    parts = email.split("@")
    if len(parts) != 2:
        return email
    name = parts[0]
    if len(name) <= 2:
        masked = name[0] + "*"
    else:
        masked = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked}@{parts[1]}"


@router.get("/")
def get_leaderboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    all_users = (
        db.query(User)
        .order_by(desc(User.xp))
        .all()
    )

    total_users = len(all_users)

    top_users = all_users[:10]

    top_list = []
    for rank, u in enumerate(top_users, start=1):
        top_list.append({
            "rank": rank,
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "initials": f"{u.first_name[0]}{u.last_name[0]}",
            "xp": u.xp,
            "level": u.level,
            "is_current_user": u.id == current_user.id,
        })

    current_rank = None
    for idx, u in enumerate(all_users, start=1):
        if u.id == current_user.id:
            current_rank = idx
            break

    current_user_in_top10 = current_rank is not None and current_rank <= 10

    current_user_entry = None
    if not current_user_in_top10 and current_rank is not None:
        current_user_entry = {
            "rank": current_rank,
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "initials": f"{current_user.first_name[0]}{current_user.last_name[0]}",
            "xp": current_user.xp,
            "level": current_user.level,
            "is_current_user": True,
        }

    return {
        "top_users": top_list,
        "current_user": current_user_entry,
        "current_rank": current_rank,
        "total_users": total_users,
    }