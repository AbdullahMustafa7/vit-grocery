# 🌿 VIT Grocery — Full Stack Grocery Delivery App

A Swiggy/Blinkit-inspired grocery delivery platform built with **Next.js 14**, **MongoDB**, **Stripe**, **NextAuth**, and **React Native (Expo)**.

---

## 📁 Project Structure

```
F:/Projects/Grocery/
├── app/                     # Next.js 14 App Router
│   ├── api/                 # All API routes
│   │   ├── auth/            # NextAuth + signup + mobile-login
│   │   ├── products/        # Products CRUD
│   │   ├── categories/      # Categories
│   │   ├── cart/            # Cart management
│   │   ├── orders/          # Orders management
│   │   ├── checkout/        # Stripe PaymentIntent creation
│   │   ├── upload/          # Cloudinary image upload
│   │   ├── admin/           # Admin: users, stats
│   │   ├── vendor/          # Vendor: products, orders
│   │   └── agent/           # Agent: deliveries
│   ├── (pages)/             # All page routes
│   └── layout.tsx           # Root layout with Navbar, Providers, PWA
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks (useCart)
├── lib/                     # Utilities (mongoose, auth, utils)
├── models/                  # Mongoose models (8 models)
├── middleware.ts             # JWT route protection
├── public/                  # Static files (manifest.json, sw.js)
├── scripts/seed.js          # Database seeder
└── mobile/                  # React Native + Expo mobile app
    ├── app/                 # Expo Router screens
    │   ├── (tabs)/          # Tab navigator (Home, Products, Cart, Orders, Profile)
    │   ├── login.tsx
    │   ├── signup.tsx
    │   ├── checkout.tsx
    │   ├── products/[id].tsx
    │   └── orders/[id].tsx
    └── utils/api.ts         # Axios client + colors
```

---

## ⚡ Quick Start (Web App)

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Stripe account (test mode)
- Cloudinary account (optional, for image upload)

### 2. Install Dependencies
```bash
cd F:/Projects/Grocery
npm install
```

### 3. Configure Environment Variables
Edit `.env.local` with your actual values:
```env
# MongoDB Atlas — create free cluster at mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/vitgrocery

# NextAuth secret — any long random string
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Stripe — get from dashboard.stripe.com (use TEST keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Cloudinary — get from cloudinary.com (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Seed the Database
```bash
npm run seed
```
This creates:
- 4 demo accounts (admin, vendor, agent, customer)
- 7 product categories
- 25 products with INR prices & images
- Vendor and agent profiles

### 5. Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

---

## 🔐 Demo Accounts

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@vitgrocery.com         | Admin@123   |
| Vendor   | vendor@vitgrocery.com        | Vendor@123  |
| Agent    | agent@vitgrocery.com         | Agent@123   |
| Customer | customer@vitgrocery.com      | Customer@123|

---

## 💳 Testing Stripe Payments

Use these test card numbers on the Checkout page:

| Card Number            | Result   |
|------------------------|----------|
| 4242 4242 4242 4242   | Success ✅ |
| 4000 0000 0000 0002   | Declined ❌ |
| 4000 0025 0000 3155   | Requires Auth |

- Expiry: any future date (e.g., 12/26)
- CVV: any 3 digits (e.g., 123)
- ZIP: any 5 digits (e.g., 12345)

---

## 📱 Mobile App (React Native + Expo)

### Setup
```bash
cd mobile
npm install
```

### Configure API URL
Edit `mobile/utils/api.ts`:
```ts
// For device testing, use your computer's local IP:
const BASE_URL = 'http://192.168.1.100:3000'

// For emulator:
// Android: 'http://10.0.2.2:3000'
// iOS simulator: 'http://localhost:3000'
```

### Run Mobile App
```bash
# Start Expo dev server
npm start

# Scan QR code with Expo Go app (iOS/Android)
# OR press 'a' for Android emulator
# OR press 'i' for iOS simulator
```

### Mobile Screens
- 🏠 **Home** — Hero banner, categories, featured products
- 🛒 **Products** — Search, filter, grid view
- 📦 **Product Detail** — Image, description, add to cart
- 🛍️ **Cart** — Manage items, quantities, checkout
- 📋 **Orders** — Order history
- 📍 **Order Detail** — Status tracking timeline
- 👤 **Profile** — User info, sign out
- 🔑 **Login/Signup** — Full auth forms

---

## 🌐 Deployment (Vercel)

### Deploy Web App
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Required Vercel Environment Variables
Set all variables from `.env.local` in the Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → set to your Vercel domain (e.g., https://vit-grocery.vercel.app)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Deploy Mobile App
```bash
cd mobile

# Install EAS CLI
npm i -g eas-cli

# Login to Expo
eas login

# Build for Android (APK)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios
```

---

## 🏗️ Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Web Frontend | Next.js 14 (App Router)        |
| Styling      | Tailwind CSS                   |
| Mobile       | React Native + Expo            |
| Backend      | Next.js API Routes             |
| Database     | MongoDB Atlas + Mongoose       |
| Auth         | NextAuth.js v4 (JWT)           |
| Payments     | Stripe Elements                |
| Images       | Cloudinary / Unsplash          |
| PWA          | Web App Manifest + Service Worker |

---

## 🔑 User Roles & Permissions

### Customer
- Browse and search products
- Add to cart, checkout with Stripe
- Track orders in real-time
- Rate delivery agents

### Vendor
- Add/edit/delete products (with images)
- Confirm orders → mark as Ready
- View sales dashboard

### Delivery Agent
- See available pickups (status: `ready`)
- Accept deliveries
- Update status: Picked Up → On the Way → Delivered
- View earnings

### Admin
- Approve/reject vendors and agents
- View all orders and update status
- Platform analytics dashboard
- Manage all products

---

## 📊 Order Flow

```
Customer places order
        ↓
  [pending] Order created, payment confirmed
        ↓
  [confirmed] Vendor confirms order
        ↓
  [ready] Vendor packs order
        ↓
  [picked_up] Agent accepts & picks up
        ↓
  [on_the_way] Agent is en route
        ↓
  [delivered] Order delivered ✅
```

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in httpOnly cookies (NextAuth)
- Account locked after **5 failed login attempts** for 15 minutes
- Server-side cart price validation (no client-side price manipulation)
- Stripe secret key never exposed to frontend
- Role-based middleware on all protected routes
- Input validation on all API endpoints

---

## 📂 API Endpoints

| Method | Endpoint                       | Auth     | Description              |
|--------|--------------------------------|----------|--------------------------|
| GET    | /api/products                  | Public   | List products (filtered) |
| GET    | /api/products/:id              | Public   | Single product           |
| POST   | /api/products                  | Vendor   | Create product           |
| PUT    | /api/products/:id              | Vendor   | Update product           |
| DELETE | /api/products/:id              | Vendor   | Delete product           |
| GET    | /api/categories                | Public   | List categories          |
| GET    | /api/cart                      | Auth     | Get user cart            |
| POST   | /api/cart                      | Auth     | Add to cart              |
| PUT    | /api/cart                      | Auth     | Update quantity          |
| DELETE | /api/cart                      | Auth     | Remove item / clear      |
| GET    | /api/orders                    | Auth     | List orders              |
| POST   | /api/orders                    | Auth     | Create order             |
| GET    | /api/orders/:id                | Auth     | Single order             |
| PUT    | /api/orders/:id                | Auth     | Update order status      |
| POST   | /api/checkout                  | Auth     | Create Stripe PaymentIntent |
| POST   | /api/auth/signup               | Public   | Register user            |
| POST   | /api/auth/mobile-login         | Public   | Mobile JWT login         |
| GET    | /api/admin/users               | Admin    | List all users           |
| PUT    | /api/admin/users               | Admin    | Approve/reject user      |
| GET    | /api/admin/stats               | Admin    | Platform statistics      |
| GET    | /api/vendor/products           | Vendor   | Vendor's products        |
| GET    | /api/vendor/orders             | Vendor   | Vendor's orders          |
| GET    | /api/agent/deliveries          | Agent    | Agent's deliveries       |
| PUT    | /api/agent/deliveries          | Agent    | Accept delivery          |
| POST   | /api/upload                    | Vendor   | Upload image to Cloudinary |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env.local`
- Whitelist your IP in MongoDB Atlas Network Access
- Ensure cluster name is correct

### Stripe Error
- Verify you're using TEST mode keys (start with `pk_test_` / `sk_test_`)
- Check webhook secret if using webhooks

### NextAuth Error
- `NEXTAUTH_SECRET` must be at least 32 characters
- `NEXTAUTH_URL` must match exactly (including http/https)

### Mobile App Can't Connect
- Use your machine's LAN IP (not localhost) when testing on real device
- Ensure web server is running on port 3000
- Check firewall settings

---

## 📞 Support

- GitHub Issues: Report bugs and feature requests
- Email: support@vitgrocery.com

Made with ❤️ for VIT students
