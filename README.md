# Service Invoice Generator (MERN Stack)

A production-ready company service invoice generator built with MongoDB, Express, React, and Node.js. Developed using **Spec-Driven Development (SDD)** in strict compliance with the engineering guidelines in [GEMINI.md](./GEMINI.md).

---

## Features

- **Company-Branded Invoice Template**: Official **tortillon** invoice layout featuring company details, letter-spaced header, itemized rates in INR (`₹`), notes, and a clean print stylesheet (`@media print`).
- **Live Preview & PDF Printing**: Interactive invoice creation form with real-time template updates and one-click browser printing/PDF export at `/invoice-preview`.
- **Concurrency-Safe Invoice Numbering**: Concurrency-safe atomic counter generating sequential invoice numbers (`INV-YYYY-XXXX`) via MongoDB.
- **Authoritative Financial Math**: Backend recalculates and enforces strict 2-decimal precision on all line items, subtotals, discounts, tax amounts, and totals.
- **Historical Snapshots**: Freezes client details and company metadata inside the invoice document at issuance time to maintain historical immutability.
- **Project Management**: CRUD operations for client projects with search, pagination, status tracking, and deletion safeguards.
- **Secure Authentication & Session**: Normalized email lookup, `bcrypt` password hashing, JWT authentication via secure HTTP-only cookies and Bearer tokens, protected routes, and login rate limiting.
- **Real-Time Dashboard Analytics**: Single-query `$facet` MongoDB aggregation computing total invoiced, outstanding balances, collection metrics, and status breakdowns.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | Single-page application |
| **Routing** | React Router v7 | Protected routes and layout shell |
| **Styling** | Modular CSS + Variables | Responsive design system |
| **API Client** | Axios | Interceptors with standardized response handling |
| **Icons** | Lucide React | Clean, accessible iconography |
| **Backend** | Node.js, Express.js | Modular REST API with MVC service architecture |
| **Database** | MongoDB & Mongoose | ODM schemas, compound indexes, atomic sequence counter |
| **Validation** | Zod | Request body, query, and parameter validation schemas |
| **Security** | Helmet, CORS, BcryptJS | Security headers, password hashing, origin filtering |

---

## Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; tested on v22.15.0)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd Backend

# Configuration
cp .env.example .env

# Start Backend in Development Mode
npm run dev
```
* The backend will run on `http://localhost:5000`.
* On the first run, the system will automatically seed a default admin user if the database is empty:
  * **Email**: `admin@example.com`
  * **Password**: `password123`

### 3. Frontend Setup
```bash
cd Frontend

# Configuration
cp .env.example .env

# Start Frontend Development Server
npm run dev
```
* The frontend will run on `http://localhost:5173`.

---

## Key Routes & Pages

| Route | Description |
|---|---|
| `/login` | Authentication page with one-click demo credentials filler |
| `/` | Dashboard with real-time MongoDB metrics and recent activity |
| `/projects` | Project & client management with pagination, search, and status filters |
| `/invoices` | Invoice history table with status management and preview links |
| `/invoices/new` | Itemized invoice creation form with side-by-side live template preview |
| `/invoice-preview` | Dedicated printable view of the **tortillon** invoice template |

---

## REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Sign in (Rate-limited, sets HTTP-only cookie)
- `POST /api/auth/logout` — Clear auth session
- `GET /api/auth/me` — Get authenticated profile
- `POST /api/auth/seed` — Seed default admin account if empty

### Projects (`/api/projects`)
- `POST /api/projects` — Create project
- `GET /api/projects` — Paginated projects (`?page=1&limit=10&search=&status=`)
- `GET /api/projects/:id` — Get project details
- `PATCH /api/projects/:id` — Update project metadata
- `DELETE /api/projects/:id` — Delete project (Safeguarded: requires archiving if active invoices exist)

### Invoices (`/api/invoices`)
- `POST /api/invoices` — Create & issue invoice (authoritative calculation + sequential numbering)
- `GET /api/invoices` — List and filter invoices
- `GET /api/invoices/:id` — Get invoice details
- `PATCH /api/invoices/:id/status` — Transition invoice status (`draft`, `issued`, `paid`, `overdue`, `cancelled`)
- `DELETE /api/invoices/:id` — Delete draft invoice (Issued/paid invoices cannot be deleted)

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/summary` — Real-time MongoDB metrics aggregation

---

## Testing

To run the automated backend unit test suite:
```bash
cd Backend
npm test
```
*Includes tests for Zod validation, JWT lifecycle, bcrypt hashing, financial calculation engine, project schemas, and brute-force rate limiting.*

To verify frontend production builds:
```bash
cd Frontend
npm run build
```

