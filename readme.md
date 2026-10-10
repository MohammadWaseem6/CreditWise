# 💳 CreditWise

> A full-stack, gamified credit card management platform built with React, TypeScript, FastAPI, and PostgreSQL.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6C3CE1?style=for-the-badge)](https://dev-waseem-credit-wise.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-00D4FF?style=for-the-badge)](https://creditwise-nomq.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Source-black?style=for-the-badge&logo=github)](https://github.com/MohammadWaseem6/CreditWise)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [dev-waseem-credit-wise.vercel.app](https://dev-waseem-credit-wise.vercel.app) |
| **Backend API** | [creditwise-nomq.onrender.com](https://creditwise-nomq.onrender.com) |
| **API Docs** | [creditwise-nomq.onrender.com/docs](https://creditwise-nomq.onrender.com/docs) |

> ⚠️ **Note:** Backend is hosted on Render's free tier. First request may take 30-60 seconds to wake up.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Bcrypt password hashing
- Protected routes with middleware
- Change password functionality
- Profile management

### 💳 Card Management
- Full CRUD operations for credit cards
- Realistic card visuals with network detection (Visa, Mastercard, Amex, Discover)
- Custom cardholder names per card
- Soft delete with history preservation
- Credit utilization tracking

### 💰 Payment Tracking
- Log payments with instant balance updates
- Automatic XP calculation (10 XP per $100 paid)
- Complete payment history
- Real-time balance synchronization

### 🎮 Gamification
- XP and leveling system
- 10 unlockable badges
- Achievement notifications
- Top-user leaderboard

### 📊 Analytics & Insights
- Interactive debt-over-time chart
- Monthly payments bar chart
- Debt distribution pie chart
- Payoff simulator with adjustable monthly payment
- Interest calculation using amortization formula

### 🎨 UI/UX
- Fully responsive (mobile, tablet, desktop)
- Dark/Light mode with persistence
- Toast notifications for all actions
- Glassmorphism design
- Smooth animations
- Empty states and loading skeletons

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **React Router v6** | Routing |
| **Axios** | HTTP client |
| **Recharts** | Data visualization |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **React Hot Toast** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Web framework |
| **Python 3.11+** | Language |
| **SQLAlchemy** | ORM |
| **PostgreSQL** | Database |
| **Pydantic** | Data validation |
| **Python-JOSE** | JWT handling |
| **Passlib + Bcrypt** | Password hashing |

### Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **Neon** | PostgreSQL database |

---

## 🏗️ Architecture
## 📁 Project Structure

```
CreditWise/
├── BACKEND/                    FastAPI Backend
│   ├── app/
│   │   ├── auth.py             JWT + password hashing
│   │   ├── database.py         DB connection + session
│   │   ├── models.py           SQLAlchemy models
│   │   ├── schemas.py          Pydantic schemas
│   │   └── routes/
│   │       ├── auth.py         Authentication
│   │       ├── cards.py        Credit card CRUD
│   │       ├── payments.py     Payment logging
│   │       ├── dashboard.py    Dashboard summary
│   │       ├── badges.py       Achievements
│   │       ├── simulator.py    Payoff calculator
│   │       ├── leaderboard.py  User rankings
│   │       └── charts.py       Analytics
│   ├── main.py                 App entry point
│   └── requirements.txt        Python dependencies
│
├── FRONTEND/                   React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── CardFormModal.tsx
│   │   │   ├── CreditCardVisual.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LogPaymentModal.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Cards.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── Badges.tsx
│   │   │   ├── Simulator.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── types/
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vercel.json
│
└── README.md
```
