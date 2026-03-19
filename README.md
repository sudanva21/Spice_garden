<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2461?style=for-the-badge&logo=razorpay" />
</p>

<h1 align="center">🌿 Spice Garden Resort</h1>
<p align="center">A full-stack web application for a luxury resort — featuring event booking with Razorpay payments, an AI chat assistant, a full admin panel, and automated ticket generation.</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Home Page** | Hero video, gallery, testimonials, and quick CTAs |
| 📅 **Events** | Browse and book event tickets with seat selection |
| 💳 **Razorpay Payments** | Secure online payment with signature verification |
| 📧 **Auto Email Tickets** | PDF ticket emailed on successful payment via Resend |
| 🤖 **AI Chat Assistant** | Gemini-powered chat widget for guest queries |
| 🍽️ **Menu & Gallery** | Digital menu and curated photo gallery |
| 👤 **User Auth** | Supabase Auth with Google OAuth support |
| 🛡️ **Admin Panel** | Full CRUD for events, bookings, blog, gallery, and more |
| 📊 **Export Registrations** | Download event bookings as PDF or Excel from the admin panel |
| 📱 **Mobile Responsive** | Optimised for all screen sizes |
| 🔍 **SEO Ready** | Meta tags, structured data (JSON-LD), and semantic HTML |

---

## 🗂️ Project Structure

```
stitch/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── pages/     # Route-level page components
│       ├── components/# Shared & admin UI components
│       ├── context/   # Auth context
│       ├── hooks/     # Custom hooks (useAdminAuth, etc.)
│       ├── lib/       # Supabase client
│       ├── constants/ # Table names, config
│       └── api.ts     # Axios API helper
│
└── backend/           # Node.js + Express + TypeScript
    └── src/
        ├── controllers/ # Request handlers per resource
        ├── routes/      # Express routers (api.ts, payment.ts)
        ├── middleware/  # Auth middleware
        ├── services/    # Business logic (AI, email, etc.)
        └── db.ts        # Supabase admin client
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (for live payments)
- A [Resend](https://resend.com) account (for transactional email)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/spice-garden.git
cd spice-garden

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure Environment Variables

#### `backend/.env`
```env
PORT=3000

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (leave blank to run in test/dev mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

# Resend (for ticket emails)
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=tickets@yourdomain.com

# Site URL (used in email links)
VITE_SITE_URL=https://yourdomain.com

# Google Gemini (for AI assistant)
GEMINI_API_KEY=your_gemini_key
```

#### `frontend/.env`
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000/api

# Must match backend RAZORPAY_KEY_ID exactly
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## 💳 Razorpay Setup

> **You need both the Key ID and Key Secret.** Just one is not enough.

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings → API Keys → Generate Key**
3. Copy the **Key ID** and **Key Secret**
4. Add them to `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
5. Add the **Key ID only** to `frontend/.env` as `VITE_RAZORPAY_KEY_ID`

**Dev Mode (no keys set):** Bookings are created and marked `pending` without real payment — useful for local testing.

**Live Mode (keys set):** Full payment → signature verification → booking confirmed → PDF ticket emailed.

---

## 🛡️ Admin Panel

Access at `/admin` (login required at `/admin/login`).

| Section | Capabilities |
|---|---|
| Events | Create, edit, delete events. View bookings per event. |
| Bookings | See all registrations. Download as **PDF** or **Excel**. |
| Blog | Write and publish blog posts |
| Gallery | Upload and manage gallery images |
| Menu | Manage restaurant menu items |
| Stats | View site-wide statistics |

---

## 🗄️ Database (Supabase)

Key tables:

| Table | Purpose |
|---|---|
| `events` | Event listings with capacity and pricing |
| `event_bookings` | Ticket bookings with payment status |
| `blog_posts` | Blog content |
| `gallery` | Gallery image references |
| `menu_items` | Restaurant menu |

The backend uses the **Supabase Service Role Key** for admin operations (bypasses Row Level Security) and the **Anon Key** on the frontend for user-scoped reads.

---

## 🔧 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7 |
| Styling | Vanilla CSS with CSS custom properties |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| Payments | Razorpay |
| Email | Resend |
| PDF | jsPDF + jspdf-autotable |
| Excel | SheetJS (xlsx) |
| AI Chat | Google Gemini API |

---

## 📄 License

MIT © Spice Garden Resort
