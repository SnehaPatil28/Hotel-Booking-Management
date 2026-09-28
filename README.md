# 🏨 Aura Boutique Hotel - Property Management System (PMS)

A full-stack, enterprise-grade Hotel Booking & Property Management System built with **MySQL (InnoDB engine)**, **Node.js/Express**, and **React + Tailwind CSS + Lucide Icons**.

---

## 🗂️ Clean Folder Structure

```
Hotel-Booking-Management/
├── 📁 database/
│   └── schema.sql              # Unified MySQL schema (Modules 1-6)
│
├── 📁 backend/
│   ├── package.json            # Backend Node.js configuration & dependencies
│   ├── server.js               # Master Express API Server (Port 5000)
│   └── src/
│       ├── config/
│       │   └── db.js           # mysql2/promise connection pool
│       └── modules/
│           ├── rooms/          # Module 1: Room Inventory & Status Control
│           ├── reservations/   # Module 2: Transactional Booking & Row Locking
│           ├── frontdesk/      # Module 3: Express Check-In & Check-Out
│           ├── billing/        # Module 4: Dynamic Ledger, 12% Tax & Invoices
│           ├── cancellation/   # Module 5: Refund Policy Rules & Room Re-release
│           └── housekeeping/   # Module 6: Turn-Down Queue & 1-Click Readying
│
└── 📁 frontend/
    ├── package.json            # Frontend React & Vite configuration
    ├── vite.config.js          # Vite config with API proxy
    ├── index.html              # HTML5 root document
    └── src/
        ├── App.jsx             # Master View Router & Provider Wrapper
        ├── main.jsx            # React DOM Entrypoint
        ├── index.css           # Tailwind CSS & Glassmorphism Theme
        ├── context/
        │   └── AppContext.jsx  # PMS Reactive State Engine & RBAC Context
        ├── data/
        │   └── initialData.js  # Offline fallback seed dataset
        ├── services/
        │   ├── api.js          # Centralized API client for http://localhost:5000/api/v1/
        │   ├── storageService.js
        │   ├── billingCalculator.js
        │   └── cancellationEngine.js
        └── components/
            ├── Navbar.jsx
            ├── Dashboard.jsx
            ├── RoomGrid.jsx
            ├── ReservationEngine.jsx
            ├── BookingModal.jsx
            ├── CancellationModal.jsx
            ├── BillingModule.jsx
            ├── HousekeepingTracker.jsx
            └── RoleGuard.jsx
```

---

## 🚀 Getting Started

### 1. Database Setup (MySQL)
Import the unified database DDL into MySQL:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Start Backend API Server
```bash
npm run server
# Or: cd backend && npm start
```
*Backend API runs at `http://localhost:5000/api/v1/`*

### 3. Start Frontend Web Application
```bash
npm run dev
# Or: cd frontend && npm run dev
```
*Frontend runs at `http://localhost:5173/`*
