from app.database import engine,Base
from app.models import  User, CreditCard, Payment, UserBadge


print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
print("")
print("Tables created:")
print("  - users")
print("  - credit_cards")
print("  - payments")
print("  - user_badges")