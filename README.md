# Zulu Jewels 💎

A luxury diamond and fine jewellery e-commerce platform built with Next.js 15 (App Router), MongoDB (Mongoose), dual payment gateways (Razorpay + Stripe), international multi-currency pricing, automated transactional emails with PDF invoices, and an obfuscated rotating-slug administrative portal.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Payment Gateways & Currency Handling](#payment-gateways--currency-handling)
- [Admin Portal Security Model](#admin-portal-security-model)
- [Deployment (Docker & CapRover)](#deployment-docker--caprover)
- [License](#license)

---

## Overview

**Zulu Jewels** is an end-to-end luxury e-commerce application designed for high-value diamond jewellery retail. It provides a client experience featuring interactive product customizers (metal variants, diamond carat/tcw specs, 360° asset viewing, wishlist, reviews), real-time international currency conversion via IP geolocation, and a dual-channel checkout system accommodating both domestic Indian payments (UPI, Netbanking) and worldwide international cards.

Behind the storefront sits a protected admin management panel featuring dashboard analytics, product catalog management, order fulfillment pipelines, automated invoice generation, and shipping zone controls.

---

## Key Features

- **Next.js 15 App Router Architecture**: Server Components, streaming, API route handlers, and client components.
- **Dual Payment Processing**:
  - **Razorpay**: Native UPI, Netbanking, Indian Credit/Debit cards, wallets (`INR`).
  - **Stripe**: Multi-currency international card checkout powered by Stripe Elements (`PaymentElement`).
- **Server-Authoritative Pricing Engine (`src/lib/pricing.js`)**:
  - Unit price resolution across products and variants.
  - Promo code discounts (e.g. `ZULU5` 5% discount).
  - 3% GST calculation on taxable subtotal.
  - Storewide complimentary shipping policy.
  - Guarantees parity between cart calculations, "Buy Now" flow, Razorpay orders, and Stripe payment intents.
- **Dynamic Currency Localization**: Automatically detects client country via IP geolocation and translates INR catalogue pricing into local currencies (USD, EUR, GBP, AED, SGD, CAD, AUD, etc.).
- **Rotating-Slug Admin Security**: The admin portal URL is obfuscated behind a cryptographically randomized slug (`/portal/[slug]`) stored in MongoDB and rotated periodically or on-demand to prevent automated scanning or unauthorized URL discovery.
- **Transactional Emails & PDF Invoices**: Automatically sends HTML order confirmation, shipping, and delivery notification emails via Nodemailer with attached PDF invoices generated dynamically using `@react-pdf/renderer`.
- **Media Asset Storage**: Direct image and media management with Cloudinary.
- **Interactive Maps**: Google Maps integration for store locator, showroom visit bookings, and delivery address geocoding.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Standalone build output) |
| **UI Library** | [React 19](https://react.dev/) / React DOM |
| **Styling** | Vanilla CSS + Tailwind CSS v4 |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) with [Mongoose 8+](https://mongoosejs.com/) |
| **Authentication** | Custom JWT authentication with HTTP-only session cookies |
| **Payment Gateways** | [Razorpay](https://razorpay.com/) (SDK `razorpay`) + [Stripe](https://stripe.com/) (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) (SMTP with HTML templates) |
| **Media Hosting** | [Cloudinary](https://cloudinary.com/) SDK |
| **Containerization** | Docker multi-stage build, Alpine Linux runner, CapRover PaaS |

---

## Project Architecture

```
zulu_jewels/
├── src/
│   ├── app/
│   │   ├── api/                           # Backend API Route Handlers
│   │   │   ├── Admin/                     # Admin operations (products, orders, analytics)
│   │   │   ├── Pages/                     # Customer-facing APIs
│   │   │   │   ├── cart/                  # Cart CRUD and calculation
│   │   │   │   ├── Payments/              # Payment integrations
│   │   │   │   │   ├── RazorPay/          # create-order, verify
│   │   │   │   │   └── Stripe/            # create-intent, verify, webhook
│   │   │   │   ├── Products/              # Product catalogue & details
│   │   │   │   └── Profile/               # Addresses & user account
│   │   │   ├── auth/                      # Login, signup, logout
│   │   │   └── currency/                  # Live exchange rate endpoints
│   │   ├── Pages/                         # Customer-facing storefront pages
│   │   │   ├── cart/                      # Cart page & checkout launcher
│   │   │   ├── Products/                  # Catalogue & product detail view
│   │   │   └── Profile/                   # Account dashboard & order history
│   │   └── portal/[slug]/                 # Rotating-slug administrative portal
│   ├── components/                        # Reusable modular UI components
│   │   ├── checkout/                      # StripeModal & payment elements
│   │   ├── common/                        # Page loaders, breadcrumbs, toasts
│   │   ├── home/                          # Hero banner, trust badges, featured
│   │   ├── layout/                        # Navbar, Footer, Drawers
│   │   └── price/                         # Currency-aware PriceDisplay
│   ├── context/                           # React context providers (CurrencyContext)
│   └── lib/                               # Core backend utilities & models
│       ├── adminAuth.js                   # JWT verification for admin sessions
│       ├── adminSecurity.js               # Dynamic rotating slug manager
│       ├── db.js                          # MongoDB Mongoose connection pooling
│       ├── emailService.js                # Nodemailer email trigger dispatcher
│       ├── orderUtils.js                  # Transactional order creation & stock management
│       ├── pricing.js                     # Unified pricing, GST & shipping engine
│       ├── rateLimit.js                   # Sliding-window IP rate limiter
│       ├── storage.js                     # Cloudinary upload helpers
│       ├── email/                         # Email templates & PDF invoice builder
│       └── models/                        # Mongoose schemas (User, Order, Product, etc.)
├── Dockerfile                             # 3-stage multi-platform container build
├── captain-definition                     # CapRover deployment manifest
└── package.json
```

---

## Environment Variables

Create a `.env` file in the repository root. Below is a comprehensive reference of all environment variables used by the application:

```env
# ── Server & Application ──────────────────────────────────────────────────────
NODE_ENV=development                       # 'development' or 'production'
BASE_URL=http://localhost:3000             # Canonical URL of the application

# ── Database ──────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/zulu_jewels # MongoDB connection string

# ── Security & Authentication ─────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key      # Secret key used for signing session JWT tokens

# ── Razorpay Payment Gateway ──────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxx            # Razorpay API Key ID (Server-side)
RAZORPAY_KEY_SECRET=xxxxxx                 # Razorpay API Key Secret (Server-side)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx# Razorpay API Key ID (Client-side checkout)

# ── Stripe Payment Gateway ────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxx           # Stripe Secret API Key (Server-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx # Stripe Publishable Key (Client-side)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx         # Stripe Webhook Signing Secret (for asynchronous events)

# ── Cloudinary Media Hosting ──────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name      # Cloudinary Cloud Name
CLOUDINARY_API_KEY=your_api_key            # Cloudinary API Key
CLOUDINARY_API_SECRET=your_api_secret      # Cloudinary API Secret

# ── Transactional Email (SMTP) ────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com                   # SMTP Mail Server host
SMTP_PORT=587                              # SMTP Mail Server port (e.g. 587 for TLS, 465 for SSL)
SMTP_USER=your_email@gmail.com             # SMTP Authentication Username / Sender Address
SMTP_PASS=your_app_specific_password       # SMTP Authentication Password (e.g. Gmail App Password)

# ── Google Maps API ───────────────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...  # Google Maps JavaScript API Key (for maps & address autocompletion)
```

---

## Local Development Setup

### Prerequisites

- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **MongoDB**: Local MongoDB daemon running on `mongodb://localhost:27017` or MongoDB Atlas URI

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/singapuriyudhish27/Zulu-Jewels.git
   cd Zulu-Jewels
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env` and fill in your credentials:
   ```bash
   cp .env.example .env   # Or create .env as outlined above
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Linting & Verification**:
   ```bash
   npm run lint
   npm run build
   ```

---

## Payment Gateways & Currency Handling

Zulu Jewels integrates a dual payment architecture tailored for high-value diamond jewellery:

### 1. Pricing Engine (`src/lib/pricing.js`)
All order calculations are verified server-side to prevent client tampering:
- **Base Price**: Looks up variant price in `ProductVariant` or falls back to base `Product` price.
- **Promotions**: Evaluates promo codes (e.g. `ZULU5` grants a 5% discount).
- **GST (Goods & Services Tax)**: Indian statutory 3% GST calculated as `Math.round(taxableSubtotal * 0.03)`.
- **Shipping**: Free complimentary worldwide delivery on all orders (`shipping = 0`).
- **Parity**: Both Razorpay `create-order` and Stripe `create-intent` routes invoke this same engine, ensuring identical final amounts.

### 2. Gateway Selection & Currency Routing
- **Razorpay**: Used for domestic transactions within India (`INR`). Supports UPI (Google Pay, PhonePe, Paytm), RuPay/Visa/MasterCard domestic cards, and Indian netbanking.
- **Stripe**: Used for international orders in foreign currencies (USD, EUR, GBP, AED, etc.) via Stripe Elements (`PaymentElement`).
- **Storefront Display**: If a user outside India browses in non-INR currency, the Cart and Product checkout interfaces prompt the shopper to checkout via Stripe, disabling Razorpay to avoid currency conversion mismatch issues.

---

## Admin Portal Security Model

To protect administrative controls from automated credential stuffing, bot scraping, and URL discovery, Zulu Jewels employs a **Rotating-Slug Security Model** (`src/lib/adminSecurity.js`):

1. **Obfuscated Path**: Instead of exposing `/admin`, the portal is mounted at `/portal/[slug]`.
2. **Cryptographic Slugs**: Slugs are generated using `crypto.randomBytes(16).toString('base64url')` (22 URL-safe characters, offering 128-bit entropy).
3. **Database Backed**: The active slug is persisted in the `AdminSecurity` collection in MongoDB.
4. **Validation & Rotation**:
   - `getCurrentAdminSlug()` retrieves or provisions the current active slug.
   - `validateAdminSlug(slug)` validates requested portal paths.
   - `rotateAdminSlug()` updates the slug in MongoDB and records `rotated_at`.
   - Access attempts to invalid slugs return 404 or redirect away.
5. **Session Verification**: Even with a valid slug, the admin panel requires a signed JWT cookie (`zulu_jewels_admin` or `zulu_jewels`) with `role === 'admin'`.

---

## Deployment (Docker & CapRover)

Zulu Jewels includes production-ready Docker configuration optimized for Next.js standalone output and CapRover PaaS.

### Architecture
- **Multi-Stage Dockerfile**:
  - `deps`: Installs production and dev dependencies with `libc6-compat` on Alpine.
  - `builder`: Builds Next.js in `standalone` mode (`next build`).
  - `runner`: Lightweight runtime container that runs as an unprivileged user (`nextjs:nodejs`, UID 1001) on port 3000.
- **CapRover Definition**: `captain-definition` points to `./Dockerfile`.

### Deploying to CapRover
1. Create a new app in your CapRover dashboard (e.g. `zulu-jewels`).
2. Add all environment variables listed in the [Environment Variables](#environment-variables) section under the app's **App Configs** tab.
   > **Note on Build Variables**: Any `NEXT_PUBLIC_*` variables needed at build time must be configured in CapRover prior to deployment.
3. Deploy via CapRover CLI:
   ```bash
   caprover deploy
   ```
   Or connect your GitHub repository for automated deployments on push to `main`.
4. Enable HTTPS / SSL with Let's Encrypt in the CapRover dashboard.

### Architectural Note: Rate Limiting & Horizontal Scaling
`src/lib/rateLimit.js` implements a sliding-window rate limiter utilizing an in-memory `Map`.
- In standard single-container deployments (CapRover default), this is high-performing and zero-dependency.
- If you scale horizontally across multiple container replicas or serverless instances, rate limit state is not shared across nodes. Before multi-node clustering, back this module with a shared Redis store (such as Upstash Redis or `@upstash/ratelimit`).

---

## License

Private and proprietary. All rights reserved by **Zulu Jewels**.
