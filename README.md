# Hotel Management System (HMS)

A full-stack Hotel Management System built with NestJS, React, PostgreSQL, and real-time WebSockets.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Room Pricing](#room-pricing)
- [Role-Based Access](#role-based-access)
- [Docker Deployment](#docker-deployment)
- [Security](#security)
- [License](#license)

---

## Overview

HMS is a production-ready hotel management platform that handles the full guest lifecycle — from room browsing and booking to check-in, payment, and check-out. It includes a real-time dashboard for admins, a guest-facing booking portal, Stripe payment integration, and live WebSocket notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10 (Node.js) |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 + Prisma ORM |
| Real-time | Socket.IO (WebSockets) |
| Auth | JWT + Refresh Tokens + RBAC |
| Payments | Stripe Checkout |
| Email | SendGrid |
| Charts | Recharts |
| State | Zustand + TanStack Query |
| Deployment | Docker + Docker Compose |

---

## Features

### Guest Portal
- Browse and search available rooms by date, guests, and room type
- View room details, amenities, and photos
- Create, view, and cancel bookings
- Stripe-powered online payment with invoice generation
- Real-time booking status notifications
- Profile management with avatar upload

### Admin / Staff Dashboard
- Live dashboard with occupancy rate, revenue, and booking stats
- Room management — create, edit, deactivate rooms and room types
- Booking management — confirm, check-in, check-out, cancel bookings
- Guest management — view all registered guests and their history
- Payment management — view transactions, process refunds
- Analytics — revenue charts, occupancy trends, room type performance
- Real-time updates via WebSocket (new bookings, room status changes)

### System
- JWT authentication with 15-minute access tokens and 7-day refresh tokens
- Role-based access control (Admin, Staff, Guest)
- Input validation on all endpoints (class-validator)
- Rate limiting — 100 requests per minute
- File uploads for room images and user avatars (5MB limit)
- Swagger API documentation at `/api/docs`
- Structured JSON logging

---

## Project Structure

```
HotelManagementSystem/
├── backend/                        # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── seed.ts                 # Demo data seeder
│   │   └── migrations/             # Migration history
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/         # @CurrentUser, @Public, @Roles
│   │   │   ├── dto/                # PaginationDto
│   │   │   ├── filters/            # Global HTTP exception filter
│   │   │   ├── guards/             # RolesGuard
│   │   │   └── interceptors/       # Logging, Transform response
│   │   ├── config/                 # App, DB, JWT, Stripe config
│   │   ├── gateway/                # Socket.IO WebSocket gateway
│   │   ├── modules/
│   │   │   ├── auth/               # Login, register, refresh, strategies
│   │   │   ├── users/              # User CRUD, avatar upload
│   │   │   ├── rooms/              # Room CRUD, search, availability
│   │   │   ├── room-types/         # Room type CRUD, pricing
│   │   │   ├── bookings/           # Booking lifecycle management
│   │   │   ├── payments/           # Stripe checkout, webhooks, refunds
│   │   │   ├── notifications/      # In-app notification system
│   │   │   ├── analytics/          # Dashboard stats, revenue, occupancy
│   │   │   └── uploads/            # Multer file upload handler
│   │   ├── prisma/                 # PrismaService (singleton)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/
│   │   ├── avatars/
│   │   └── rooms/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               # ProtectedRoute
│   │   │   ├── navigation/         # Sidebar, Navbar
│   │   │   └── ui/                 # Modal, LoadingSpinner, etc.
│   │   ├── hooks/                  # useRooms, useBookings, useAnalytics...
│   │   ├── layouts/                # AdminLayout, PublicLayout
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance with interceptors
│   │   │   ├── socket.ts           # Socket.IO client
│   │   │   └── utils.ts            # formatCurrency (ETB), formatDate, etc.
│   │   ├── pages/
│   │   │   ├── admin/              # Dashboard, Rooms, Bookings, Guests,
│   │   │   │                       # Payments, Analytics, RoomTypes
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── guest/              # MyBookings, BookingDetail,
│   │   │   │                       # Profile, Notifications
│   │   │   └── public/             # Home, SearchRooms, RoomDetail
│   │   ├── store/                  # Zustand auth store
│   │   └── App.tsx                 # Route definitions
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ (or use Docker)
- **npm** 9+

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd HotelManagementSystem
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and secrets (see Environment Variables section)

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if your backend runs on a different port
```

### 4. Set up the database

```bash
cd backend

# Run migrations to create all tables
npx prisma migrate dev --name init

# Seed with demo users, room types, and rooms
npm run prisma:seed
```

### 5. Start development servers

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm run start:dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm run dev
```

### 6. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| Prisma Studio | `npx prisma studio` (in backend/) |

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | API server port (default: `3001`) |
| `APP_URL` | Yes | Backend base URL |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | Yes | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token TTL (e.g. `7d`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `SENDGRID_API_KEY` | No | SendGrid API key for emails |
| `SENDGRID_FROM_EMAIL` | No | Sender email address |
| `UPLOAD_DIR` | No | File upload directory (default: `./uploads`) |
| `MAX_FILE_SIZE` | No | Max upload size in bytes (default: `5242880`) |
| `THROTTLE_TTL` | No | Rate limit window in seconds (default: `60`) |
| `THROTTLE_LIMIT` | No | Max requests per window (default: `100`) |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_WS_URL` | Yes | WebSocket server URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (`pk_test_...`) |

---

## Database

### Schema Overview

```
Users
 └── Bookings ──── Payments
      └── Rooms ── RoomTypes

Users
 └── Notifications
```

### Models

| Model | Description |
|---|---|
| `User` | Guests, staff, and admins with RBAC roles |
| `RoomType` | Room categories with base price and amenities |
| `Room` | Individual rooms linked to a room type |
| `Booking` | Reservation with check-in/out dates and status |
| `Payment` | Stripe payment record linked to a booking |
| `Notification` | In-app notifications per user |

### Enums

**UserRole:** `ADMIN` · `STAFF` · `GUEST`

**BookingStatus:** `PENDING` · `CONFIRMED` · `CHECKED_IN` · `CHECKED_OUT` · `CANCELLED` · `NO_SHOW`

**PaymentStatus:** `PENDING` · `PROCESSING` · `COMPLETED` · `FAILED` · `REFUNDED` · `PARTIALLY_REFUNDED`

**RoomStatus:** `AVAILABLE` · `OCCUPIED` · `MAINTENANCE` · `RESERVED` · `OUT_OF_SERVICE`

### Useful Prisma commands

```bash
cd backend

npx prisma migrate dev          # Create and apply a new migration
npx prisma migrate deploy       # Apply migrations in production
npx prisma db push              # Push schema without migration (dev only)
npx prisma studio               # Open visual DB browser
npx prisma generate             # Regenerate Prisma client
npm run prisma:seed             # Run seed script
```

---

## Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | admin@hotel.com | Admin@123 | Full system access |
| Staff | staff@hotel.com | Staff@123 | Bookings, rooms, guests |
| Guest | guest@hotel.com | Guest@123 | Own bookings and profile |

---

## API Reference

Full interactive documentation is available at **http://localhost:3001/api/docs** (Swagger UI).

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register a new guest account |
| POST | `/api/v1/auth/login` | Public | Login and receive tokens |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| POST | `/api/v1/auth/logout` | Bearer | Logout and invalidate refresh token |
| GET | `/api/v1/auth/me` | Bearer | Get current user profile |

### Rooms

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/rooms` | Bearer | List all rooms (paginated) |
| GET | `/api/v1/rooms/search` | Public | Search available rooms by date/guests |
| GET | `/api/v1/rooms/:id` | Bearer | Get room details |
| POST | `/api/v1/rooms` | Admin/Staff | Create a new room |
| PATCH | `/api/v1/rooms/:id` | Admin/Staff | Update room details |
| DELETE | `/api/v1/rooms/:id` | Admin | Deactivate a room |

### Room Types

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/room-types` | Public | List all room types |
| POST | `/api/v1/room-types` | Admin | Create room type (ETB 899.99–4,999.99) |
| PATCH | `/api/v1/room-types/:id` | Admin | Update room type |
| DELETE | `/api/v1/room-types/:id` | Admin | Delete room type |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/bookings` | Bearer | List bookings (own for guests, all for admin) |
| POST | `/api/v1/bookings` | Bearer | Create a new booking |
| GET | `/api/v1/bookings/:id` | Bearer | Get booking details |
| POST | `/api/v1/bookings/:id/confirm` | Admin/Staff | Confirm a pending booking |
| POST | `/api/v1/bookings/:id/check-in` | Admin/Staff | Check in a guest |
| POST | `/api/v1/bookings/:id/check-out` | Admin/Staff | Check out a guest |
| POST | `/api/v1/bookings/:id/cancel` | Bearer | Cancel a booking |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/payments` | Admin/Staff | List all payments |
| POST | `/api/v1/payments/checkout/:bookingId` | Bearer | Create Stripe checkout session |
| POST | `/api/v1/payments/webhook` | Public | Stripe webhook handler |
| POST | `/api/v1/payments/refund/:bookingId` | Admin | Process a refund |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/analytics/dashboard` | Admin/Staff | Dashboard stats |
| GET | `/api/v1/analytics/revenue` | Admin/Staff | Revenue chart data |
| GET | `/api/v1/analytics/occupancy` | Admin/Staff | Monthly occupancy data |
| GET | `/api/v1/analytics/room-types` | Admin/Staff | Revenue by room type |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users` | Admin | List all users |
| GET | `/api/v1/users/:id` | Bearer | Get user profile |
| PATCH | `/api/v1/users/:id` | Bearer | Update user profile |
| POST | `/api/v1/uploads/avatar` | Bearer | Upload profile avatar |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/notifications` | Bearer | Get user notifications |
| PATCH | `/api/v1/notifications/:id/read` | Bearer | Mark notification as read |
| PATCH | `/api/v1/notifications/read-all` | Bearer | Mark all as read |

---

## WebSocket Events

Connect to the WebSocket server at `VITE_WS_URL` using Socket.IO.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join` | `{ userId }` | Join user-specific notification room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `booking:new` | Booking object | New booking created |
| `booking:updated` | Booking object | Booking status changed |
| `room:status-updated` | Room object | Room status changed |
| `notification:new` | Notification object | New notification for user |
| `payment:completed` | Payment object | Payment confirmed |

---

## Room Pricing

All prices are in **Ethiopian Birr (ETB)**. Base price range: **ETB 899.99 – ETB 4,999.99** per night.

| Room Type | Base Price | Max Guests | Key Amenities |
|---|---|---|---|
| Standard Single | ETB 899.99 | 1 | WiFi, TV, AC, Private Bathroom, Mini Fridge |
| Standard Double | ETB 1,299.99 | 2 | WiFi, TV, AC, Private Bathroom, Mini Fridge, Work Desk |
| Family Room | ETB 1,799.99 | 4 | WiFi, TV, AC, Private Bathroom, Mini Fridge, Bunk Beds, Kids Corner |
| Deluxe Suite | ETB 2,499.99 | 3 | WiFi, Smart TV, AC, Jacuzzi, Mini Bar, Work Desk, Lounge Area, Room Service |
| Presidential Suite | ETB 4,999.99 | 4 | WiFi, Smart TV, AC, Jacuzzi, Full Bar, Kitchen, Dining Area, Butler Service, Balcony |

Total amount is calculated as: `basePrice × numberOfNights`.

---

## Role-Based Access

| Feature | Guest | Staff | Admin |
|---|---|---|---|
| Browse & search rooms | ✅ | ✅ | ✅ |
| Create booking | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ✅ | ✅ |
| Pay online (Stripe) | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Confirm bookings | ❌ | ✅ | ✅ |
| Check-in / Check-out | ❌ | ✅ | ✅ |
| View all bookings | ❌ | ✅ | ✅ |
| View all guests | ❌ | ✅ | ✅ |
| Manage rooms | ❌ | ✅ | ✅ |
| Process refunds | ❌ | ❌ | ✅ |
| Manage room types | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Docker Deployment

### Development with Docker

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d --build

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed the database
docker-compose exec backend npm run prisma:seed

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

### Services

| Service | Container | Port |
|---|---|---|
| PostgreSQL | hms-postgres | 5432 |
| Backend API | hms-backend | 3001 |
| Frontend | hms-frontend | 3000 |

### Production environment variables

Create a `.env` file in the project root before running Docker Compose:

```env
JWT_SECRET=your-strong-random-secret
JWT_REFRESH_SECRET=your-strong-random-refresh-secret
FRONTEND_URL=https://yourdomain.com
APP_URL=https://api.yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourhotel.com
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=https://api.yourdomain.com
```

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Access tokens | JWT, 15-minute expiry |
| Refresh tokens | JWT, 7-day expiry, stored hashed in DB |
| Transport security | Helmet middleware (security headers) |
| CORS | Restricted to `FRONTEND_URL` |
| Rate limiting | 100 requests / 60 seconds per IP |
| Input validation | class-validator on all DTOs, whitelist mode |
| SQL injection | Prevented by Prisma ORM parameterized queries |
| File uploads | Type and size validation (max 5MB) |
| RBAC | Guard-enforced role checks on every protected route |

---

## License

MIT
