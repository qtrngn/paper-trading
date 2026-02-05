# 📈 Paper Trading Simulator

A personal full-stack project that simulates stock trading with virtual cash using real market data.
Built to practice full-stack engineering, auth, and portfolio/ordering logic.

---

## 🔐 Authentication

This app requires users to **register or log in** before accessing the simulator.

**What auth does:**
- Creates a user account and keeps sessions persistent
- Protects simulator pages/routes behind login
- Associates all simulator data (cash balance, positions, orders) to a specific user

**Supported sign-in methods:**
- Email + password 
- Google sign-in 

> Note: Authentication is handled with Firebase Auth, and the app uses the authenticated user ID to read/write the user’s simulator data.

---

## ✨ What This Project Is

A “paper trading” environment where users can:
- view quotes/charts,
- and place simulated buy/sell orders using a virtual balance.


---

## 🧱 Tech Stack 

- Frontend: React + Vite
- Backend: Node.js + Express
- Auth: Firebase Authentication
- Data: Firestore
- Market data: Alpaca 

---

## 📜 Disclaimer

This project is for educational/demo purposes only.
It does **not** execute real trades and is **not** financial advice.