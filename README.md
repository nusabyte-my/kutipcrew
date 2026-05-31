# 💀 KutipCrew

**We collect so you don't have to chase.**

A brutalist split-bill and payment tracker app with a mafia/gangster debt collection theme. Create bills, share links, send funny death threats via WhatsApp, chat with an AI-powered Mafia Boss (Don Salvatore), and play mini-games when deadlines pass — all without the awkward chasing.

Built for the **Tracker Web App Challenge**.

![Brutalist Design](https://img.shields.io/badge/Design-Brutalist-black?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-KutipCrew%20🔫-red?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Hono%20+%20Bun%20+%20React-green?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-orange?style=for-the-badge)

---

## ✨ Features

### Core
- **Bill Creation** — Set up bills with title, amount, participants, due date, description, and bank details
- **Shareable Links** — Unique link per bill (`/bill/:token`), perfect for WhatsApp sharing
- **Payment Tracking** — Real-time dashboard showing paid/unpaid status, progress bar, collected vs remaining
- **Member Confirmation** — Members can confirm payment via code or through Don Salvatore AI chat
- **Organizer Dashboard** — View all bills, toggle payment status, delete bills, see aggregate stats
- **Mobile-First** — Fully responsive, optimized for WhatsApp link opens on phones

### Bonus Features
- **🤖 Don Salvatore AI Chat** — Groq-powered (LLaMA 3.3 70B) mafia boss guides members through payment via real-time WebSocket chat. Funny, dramatic, and auto-marks as paid when confirmed
- **📱 WhatsApp Threats** — Send personalized funny death threats to unpaid members via Baileys (WhatsApp Web API). Includes bank details in message
- **📲 QR Code Login** — Scan QR to connect your WhatsApp directly from the app
- **🎮 Mini-Games Arena** — When deadlines pass, unpaid members can play:
  - 🔫 **Russian Roulette** — Spin the wheel of doom for random funny consequences
  - ✊✋✌️ **Batu Gunting Kertas** — Beat Don Salvatore at Rock Paper Scissors for mercy
  - 🎲 **Debt Dice** — Roll 2 dice; higher roll = more mercy from The Crew
- **💬 Rotating Warnings** — Landing page cycles through 16 warnings in English, Bahasa Malaysia, and Manglish every 60 seconds
- **🏦 Bank Details** — Organizer provides bank info that gets included in WhatsApp messages and displayed on bill pages

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | **Bun** | 3x faster than Node.js, native TypeScript, single binary |
| Backend | **Hono** | Lightweight router, minimal overhead, middleware ecosystem |
| Database | **PostgreSQL** | Relational integrity for payment tracking, ACID-compliant |
| Frontend | **React 19 + Vite 8** | Fast HMR, modern React features |
| Styling | **Tailwind CSS v4** | Rapid UI iteration, custom brutalist theme |
| Icons | **Majesticons** (Iconify) | Bold line icons matching brutalist aesthetic |
| Server State | **TanStack Query** | Caching, background refetch, mutation management |
| AI Chat | **Groq SDK** (LLaMA 3.3 70B) | Ultra-fast inference for real-time chat responses |
| WhatsApp | **Baileys** | Lightweight WhatsApp Web API, no browser needed |
| WebSocket | **Bun.serve WS** | Native WebSocket support for real-time chat |
| Validation | **Zod** | Runtime type validation for all API inputs |

---

## 📁 Project Structure

```
kutipcrew/
├── api/                          # Hono + Bun backend
│   ├── src/
│   │   ├── index.ts              # Entry point, HTTP + WebSocket server
│   │   ├── routes/
│   │   │   ├── bills.ts          # Bill CRUD endpoints
│   │   │   ├── participants.ts   # Participant management
│   │   │   ├── payments.ts       # Payment confirmation
│   │   │   ├── whatsapp.ts       # WhatsApp threat sending + QR
│   │   │   └── chat.ts           # Chat session management
│   │   ├── services/
│   │   │   ├── billService.ts    # Bill business logic
│   │   │   ├── paymentService.ts # Payment + stats logic
│   │   │   ├── groqService.ts    # Don Salvatore AI (Groq/LLaMA)
│   │   │   ├── whatsappService.ts# Baileys WhatsApp integration
│   │   │   ├── chatService.ts    # WebSocket chat session manager
│   │   │   └── threatMessages.ts # Funny death threat templates
│   │   ├── db/
│   │   │   ├── client.ts         # PostgreSQL connection pool
│   │   │   ├── schema.sql        # Database schema
│   │   │   └── init.ts           # Schema initialization script
│   │   └── types/
│   │       ├── bill.ts           # Bill TypeScript interfaces
│   │       └── participant.ts    # Participant interfaces
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── web/                          # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx               # Root component, routing, providers
│   │   ├── main.tsx              # Entry point
│   │   ├── index.css             # Tailwind + brutalist custom styles
│   │   ├── components/
│   │   │   ├── BrutalistButton.tsx  # Styled button with icon support
│   │   │   ├── BrutalistCard.tsx    # Card with shadow + hover effects
│   │   │   ├── BillCard.tsx         # Bill summary card
│   │   │   ├── ParticipantList.tsx  # Participant list with status
│   │   │   ├── PaymentProgress.tsx  # Animated progress bar
│   │   │   ├── CreateBillForm.tsx   # Full bill creation form
│   │   │   ├── ChatSession.tsx      # Real-time Don Salvatore chat
│   │   │   └── MiniGames.tsx        # Russian Roulette, RPS, Debt Dice
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with rotating warnings
│   │   │   ├── CreateBill.tsx       # Bill creation page
│   │   │   ├── ViewBill.tsx         # Public bill view + actions
│   │   │   └── Dashboard.tsx        # Organizer dashboard
│   │   ├── lib/
│   │   │   ├── api.ts               # API client (fetch wrapper)
│   │   │   └── utils.ts             # Formatting, clipboard, helpers
│   │   └── types/
│   │       └── index.ts             # Shared TypeScript types
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── deploy.sh                     # VPS deployment script
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- PostgreSQL 14+ (native install)
- [Groq API Key](https://console.groq.com/) (free tier available)

### 1. Clone & Install

```bash
git clone https://github.com/nusabyte-my/kutipcrew.git
cd kutipcrew

# Backend
cd api && bun install && cd ..

# Frontend
cd web && bun install && cd ..
```

### 2. Set Up Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE kutipcrew;"

# Configure backend
cd api
cp .env.example .env
# Edit .env with your PostgreSQL credentials and Groq API key

# Initialize schema
bun run db:init
cd ..
```

### 3. Configure Environment

**Backend (`api/.env`):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kutipcrew
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Frontend (`web/.env`):**
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd api
bun run dev
```

**Terminal 2 — Frontend:**
```bash
cd web
bun run dev
```

Visit **http://localhost:5173** to use the app!

---

## 🔌 API Reference

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bills` | Create a new bill with participants |
| GET | `/api/bills` | List all bills |
| GET | `/api/bills/:id` | Get bill by ID |
| GET | `/api/bills/share/:token` | Get bill by share token |
| PUT | `/api/bills/:id` | Update bill |
| DELETE | `/api/bills/:id` | Delete bill |

### Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bills/:billId/participants` | Add participants to bill |
| GET | `/api/bills/:billId/participants` | List participants |
| PUT | `/api/participants/:id/pay` | Mark participant as paid |
| PUT | `/api/participants/:id/unpay` | Mark participant as unpaid |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/confirm` | Confirm payment with code |
| GET | `/api/payments/stats/:billId` | Get payment statistics |

### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp/start` | Initialize WhatsApp (Baileys) |
| GET | `/api/whatsapp/status` | Check connection status |
| GET | `/api/whatsapp/qr` | Get QR code for linking |
| POST | `/api/whatsapp/send/:billId` | Send threats to unpaid members |
| POST | `/api/whatsapp/send-preview` | Preview threat message |

### Chat (Don Salvatore AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/sessions` | Create chat session for participant |
| GET | `/api/chat/sessions/:id` | Get session info |
| WS | `/ws/chat?session=:id&name=:name` | WebSocket for real-time chat |

---

## 🎮 Mini-Games

When a bill's deadline passes, unpaid members unlock the **Mini-Games Arena**:

### 🔫 Russian Roulette
- 6 chambers, spin the wheel
- Random funny consequence assigned (buy teh tarik, sing in group call, change WhatsApp status, etc.)

### ✊✋✌️ Batu Gunting Kertas
- Play Rock Paper Scissors against Don Salvatore
- Win = 24 extra hours to pay
- Lose = Buy Don Salvatore roti canai as tribute

### 🎲 Debt Dice
- Roll 2 dice (2-12)
- Low roll = double shame
- High roll = Don Salvatore grants mercy

---

## 🤖 Don Salvatore AI Chat

Powered by **Groq** running **LLaMA 3.3 70B Versatile**:

- Stays in character as a funny mafia/gangster boss
- Mixes Italian-American mobster slang with Malaysian/Mamak humor
- Guides participants through payment confirmation
- Auto-detects when user confirms payment → marks as paid automatically
- References bank details provided by organizer
- Celebrates dramatically when someone pays

---

## 🎨 Design System

### Color Palette
```
Black:    #0a0a0a    Primary borders, buttons
White:    #ffffff    Card backgrounds
Red:      #ff0033    Danger, unpaid, threats
Green:    #00ff66    Success, paid
Yellow:   #ffcc00    Warning, highlights
Pink:     #ff0066    Accents
Cyan:     #00ffff    Accents
Orange:   #ff6600    Urgency
```

### Typography
- **Headings:** Impact, Haettenschweiler (bold, dramatic, uppercase)
- **Body:** Courier Prime (monospace, brutalist)
- **Accent:** Comic Sans MS (ironic, comedic)

### UI Patterns
- Thick 4px black borders on everything
- Hard box shadows (`8px 8px 0px`)
- Hover: shadow reduces + element translates
- Active: shadow disappears + translate down
- Pulsing animation on CTAs
- Shake animation on overdue items

---

## 🚢 Deployment

### VPS Setup (PM2 + Nginx)

```bash
# 1. Build frontend
cd web && bun run build

# 2. Start backend with PM2
cd ../api
pm2 start bun --name "kutipcrew-api" -- run start

# 3. Configure Nginx
```

**Nginx config example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/kutipcrew/web/dist;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📋 Requirements Checklist

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Bill Creation | ✅ |
| 2 | Shareable Bill Page | ✅ |
| 3 | Member Payment Confirmation | ✅ |
| 4 | Organizer Dashboard | ✅ |
| 5 | Payment Progress Display | ✅ |
| 6 | Mobile-Friendly Design | ✅ |
| 7 | Creative Theme / Branding | ✅ |
| 8 | GitHub Repository | ✅ |
| 9 | Short Project Description | ✅ |
| 10 | Optional Bonus Features | ✅ |
| 11 | Minimum Acceptance Criteria | ✅ |

---

## 🙏 Acknowledgments

- Built for the **Tracker Web App Challenge**
- Icons by [Majesticons](https://icon-sets.iconify.design/majesticons/)
- AI powered by [Groq](https://groq.com/) (LLaMA 3.3 70B)
- WhatsApp integration via [Baileys](https://github.com/WhiskeySockets/Baileys)
- Inspired by every group meal where someone "forgot their wallet"

---

**KutipCrew — We collect so you don't have to chase 💀🔫**

*The Crew never forgets...*
