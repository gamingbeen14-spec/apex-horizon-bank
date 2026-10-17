# Apex Horizon National Bank - Online Banking Simulator

An authentic, modern retail banking web application built with **HTML5, Tailwind CSS, Lucide icons, and Vanilla JavaScript** featuring real-time client-side state management and a mock database engine (`localStorage`).

---

## 🏛️ Application Architecture & Features

### 1. Authentication Portal (Login Gateway)
- **Dual-Entry Portal Switcher:** Clean toggle between **Customer Portal** and **Bank Officer / Admin Portal**.
- **Credentials & Recovery:** Username/Account Number, Password masking toggle, Remember Me device flag, and a **Forgot Password** recovery guidance modal.
- **Demo Quick-Fillers:** One-click autofill for immediate testing (`jane / 1234` or `admin / admin`).
- **Security Ticker:** 256-Bit TLS 1.3 encryption indicator, FDIC insurance disclosures, and active live countdown session timer (5:00 auto-logout).

### 2. Customer Dashboard
- **Real-Time Account Overview:**
  - **Premier Checking Account:** Live balance and masked account reference.
  - **High-Yield Growth Savings Account:** Live balance with 4.85% APY yield tracking.
  - **Combined Net Portfolio:** Real-time liquidity calculation.
  - **Recent Ledger Activity:** Quick summary table of recent debits and credits.
- **Funds Transfer Module (ACH & Fedwire):**
  - Source account selection (Checking or Savings) with real-time balance checks.
  - Beneficiary account number, beneficiary name, and 9-digit ABA routing code (`021000021`).
  - Validation: Prevents overdrawing available funds, validates 9-digit routing, and updates sender/receiver ledgers immediately.
  - Internal customer transfer recognition: Transferring to another registered patron automatically credits their balance and logs a counterpart transaction.
  - Quick amount presets (`+$100`, `+$500`) and transaction memo/purpose selector.
- **Account Statements & Transaction History:**
  - Full audit trail of credit/debit records with running balances.
  - Multi-parameter filtering: Live search bar, account selector, type filter (Debit / Credit), and sorting (Newest, Oldest, Highest amount).
  - Encrypted Statement export (instant CSV export download).
- **Banking Products & Service Requests:**
  - **Credit Card Application:** Tier selection (*Apex Platinum Rewards*, *Horizon Sapphire Infinite*, *Apex Executive Corporate*), annual income verification, employment category, and filing status tracking.
  - **Chequebook Request:** Leaf count selection (25, 50, 100 leaves), linked account selection, confirmed mailing address, and automated dispatch logging.
  - **Live Filing Status Table:** Shows status badges (`Pending Review`, `Approved & Dispatched`, `Declined`).
- **Self-Account Transfer:**
  - Instant transfer modal between personal Checking and Savings accounts.

### 3. Admin Dashboard (Supervisory Console)
- **Central Liquidity & Vault Monitor:**
  - Total registered active users metric.
  - Total systemwide liquidity across all patron accounts.
  - Real-time pending compliance approvals counter.
  - Global system transaction stream across all customer accounts.
- **User Directory (Management Table):**
  - Table of all registered bank patrons with compliance-masked account numbers (`•••• •••• 4891`).
  - Checking and Savings balance oversight.
  - Customer inspection audit dialog.
  - **Register New Patron Modal:** Admin can enroll new customers with initial opening balances.
- **Approval Queue:**
  - Dedicated administrative queue for customer Credit Card and Chequebook filings.
  - Interactive **Approve** and **Decline** decision actions that update the customer's portal in real-time.
  - Status filters (`Pending Only`, `All Requests`, `Approved`, `Rejected`).

---

## 🚀 How to Run Locally

### Option A: Full-Stack Mode with MongoDB Atlas Backend (Recommended)
1. Add your MongoDB Atlas connection string in [.env](file:///c:/mini%20project/.env):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.your-id.mongodb.net/apex_bank?retryWrites=true&w=majority
   PORT=5000
   ```
2. Start the backend server:
   ```bash
   npm start
   # or: node server.js
   ```
3. Open **http://localhost:5000** in your browser. All transactions, accounts, and requests will automatically sync to your MongoDB database!

### Option B: Standalone Frontend Mode (Simulated / LocalStorage)
```bash
python -m http.server 3000
```
Open **http://localhost:3000**. The app will run smoothly with localStorage persistence.

---

## 🔑 Demo Credentials

| Role | Username | Password | Checking Balance | Savings Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Customer 1** | `jane` | `1234` | $14,250.75 | $48,900.20 |
| **Customer 2** | `alex` | `1234` | $6,840.50 | $18,500.00 |
| **Bank Officer / Admin** | `admin` | `admin` | Superuser | System Liquidity |

*(You can also use the on-screen "Quick Demo Fillers" on the login screen to authenticate instantly)*
