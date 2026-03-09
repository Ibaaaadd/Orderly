# 🍽️ Orderly — Restaurant POS & Food Ordering

A modern, mobile-first restaurant food ordering web app. Customers browse the menu, add items to cart, pay with QRIS, and receive real-time payment confirmation.

---

## ✨ Features

- 📱 **Mobile-first UI** — TailwindCSS, Framer Motion animations, responsive grid
- 🗂️ **Category filtering** — animated tab bar for Makanan, Minuman, Snack
- 🛒 **Slide-in cart drawer** — Zustand-powered, persistent across page refresh
- 💳 **QRIS Payment** — QR code displayed instantly, auto-polling every 5s
- ✅ **Order success page** — animated confirmation with order summary
- 📋 **Order history** — view all past orders with status badges
- 🔔 **Toast notifications** — success / error / warning
- 🦴 **Skeleton loaders** — smooth loading states throughout
- 🔒 **Webhook validation** — signature verification for Midtrans & Xendit

---

## 🏗️ Tech Stack

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React 18, Vite, TailwindCSS 3   |
| State     | Zustand (with localStorage persistence) |
| HTTP      | Axios                           |
| Animation | Framer Motion                   |
| Icons     | Lucide React                    |
| QR Code   | qrcode.react                    |
| Backend   | Node.js, Express 4              |
| Database  | PostgreSQL                      |
| Payment   | QRIS via Midtrans / Xendit / Mock |

---

## 📁 Project Structure

```
Orderly/
├── frontend/                  # React + Vite app
│   └── src/
│       ├── app/               # App entry + router
│       ├── pages/             # MenuPage, CartPage, PaymentPage, SuccessPage, OrdersPage
│       ├── components/
│       │   ├── ui/            # Button, Modal, Input, Badge, Card, Loader, Toast
│       │   ├── layout/        # Navbar, Container
│       │   ├── menu/          # MenuCard, CategoryTabs, MenuGrid
│       │   ├── cart/          # CartDrawer, CartItem, CartSummary
│       │   └── payment/       # QRPayment, PaymentStatus
│       ├── hooks/             # useCart, useFetch
│       ├── store/             # cartStore (Zustand)
│       ├── services/          # api.js, orderService.js, paymentService.js
│       └── utils/             # formatPrice.js
│
└── backend/                   # Express API
    ├── src/
    │   ├── config/            # db.js (PostgreSQL pool)
    │   ├── controllers/       # menuController, categoryController, orderController, paymentController
    │   ├── routes/            # menuRoutes, categoryRoutes, orderRoutes, paymentRoutes
    │   ├── models/            # menuModel, orderModel, paymentModel
    │   ├── services/          # paymentService.js (Midtrans / Xendit / Mock)
    │   ├── middleware/        # errorHandler.js, webhookValidator.js
    │   ├── utils/             # calculateTotal.js
    │   ├── app.js             # Express app setup
    │   └── server.js          # HTTP server entry
    ├── database/
    │   ├── schema.sql         # DDL — create all tables
    │   └── seed.sql           # Sample categories + menus
    └── scripts/
        └── setupDb.js         # npm run db:setup
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or pnpm

---

### 1. Database Setup

```sql
-- In psql / pgAdmin:
CREATE DATABASE orderly;
```

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npm run db:setup   # creates schema + seeds data
```

---

### 2. Backend

```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## 🌐 API Reference

### Categories

```
GET  /api/categories          → List all categories
```

### Menus

```
GET  /api/menus               → List all menus
GET  /api/menus?category_id=1 → Filter by category
GET  /api/menus/:id           → Single menu
```

### Orders

```
POST /api/orders
Body: { "customer_name": "Budi", "items": [{ "menu_id": 1, "qty": 2 }] }

GET  /api/orders              → All orders
GET  /api/orders/:id          → Single order (includes items)
```

### Payments

```
POST /api/payments/create
Body: { "order_id": 1 }
Response: { "qris_url": "...", "reference_id": "MOCK-XXXX" }

POST /api/payments/webhook    → Gateway callback (signature validated)
```

---

## 💳 Payment Gateway

Set `PAYMENT_GATEWAY` in `backend/.env`:

| Value       | Description                              |
|-------------|------------------------------------------|
| `mock`      | Local demo — no real API calls           |
| `midtrans`  | Midtrans QRIS Charge API                 |
| `xendit`    | Xendit Dynamic QR Code API               |

### Switch to Midtrans
```env
PAYMENT_GATEWAY=midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-...
```

### Switch to Xendit
```env
PAYMENT_GATEWAY=xendit
XENDIT_API_KEY=xnd_development_...
XENDIT_CALLBACK_TOKEN=...
XENDIT_CALLBACK_URL=https://your-domain.com/api/payments/webhook
```

---

## 🗺️ Customer Flow

```
1. Open app → browse menu by category
2. Tap food card → added to cart (animated badge)
3. Floating cart button → open CartDrawer
4. Enter name → tap "Bayar Sekarang"
5. Backend creates order → calls payment gateway
6. PaymentPage displays QRIS QR code
7. Customer scans with e-wallet app
8. Gateway sends webhook → order → PAID
9. Frontend polls every 5s → detects PAID
10. Redirect to SuccessPage 🎉
```

---

## 🗄️ Database Schema

```
categories   (id, name, created_at)
menus        (id, category_id, name, price, image_url, is_available, created_at)
orders       (id, customer_name, total_price, status, payment_reference, created_at)
order_items  (id, order_id, menu_id, price, qty, subtotal)
payments     (id, order_id, gateway, reference_id, qris_url, payment_status, created_at)
```

---

## 🔒 Security

- Helmet.js sets secure HTTP headers
- CORS restricted to frontend origin
- Rate limiting: 200 req / 15 min on `/api/*`
- Webhook signature verification (Midtrans SHA-512 / Xendit token)
- Parameterised SQL queries — no SQL injection risk
- Input validation on all POST endpoints
- No secrets committed (`.env` in `.gitignore`)
