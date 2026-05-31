# 💀 KUTIPCREW

<div align="center">

**We collect so you don't have to chase.**

![Runtime](https://img.shields.io/badge/Runtime-Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Hono-ffffff?style=for-the-badge&logo=hono&logoColor=black)
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![AI](https://img.shields.io/badge/AI-Groq_LLaMA_3.3-orange?style=for-the-badge&logo=groq&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Bun_Native-000000?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)

</div>

```
ALAMAK you still owe money? Jangan risau — The Crew is here.
Dato' Jalal will handle it. With style. Dengan maruah. 🤌
```

---

## 📋 APA NI?

KutipCrew is a split-bill tracker with **personality**. Create bills, add your friends (with their phone numbers!), share the link, and let **Dato' Jalal** — our AI-powered Malaysian debt collector — do the chasing for you.

**No more awkward "eh dah bayar ke belum?" messages.** Just send the link, and The Crew takes over.

---

## ✨ APA DIA BOLEH BUAT?

### 🎯 Core Features

| Feature | Cerita |
|---------|--------|
| **Create Bill** | Title, amount, participants, due date, description, bank details. All in. |
| **Share Link** | Unique link per bill. Perfect for WhatsApp. Copied in one click. |
| **Dashboard** | See all bills, who paid, who belum bayar, total collected vs remaining. |
| **Payment Progress** | Green bar = good. Red bar = Dato' Jalal coming to visit. 💀 |
| **Chat dengan Dato' Jalal** | Real-time AI chat powered by Groq LLaMA 3.3. He will chase them for you. |
| **WhatsApp Threats** | Send personalized funny death threats with bank details included. (Jokes only lah. Or is it?) |
| **Mini-Games** | Bill overdue? Debtors can play games to earn mercy! |
| **Payment QR Upload** | DuitNow / TnG / bank QR — upload once, seen by all. |

### 🎮 Mini-Games Arena

When deadline passes, unpaid members unlock:

| Game | Macam Mana | Kalau Kalah |
|------|-----------|-------------|
| 🔫 **Russian Roulette** | Spin the wheel. 6 chambers. 1 consequence. | Buy teh tarik for everyone |
| ✊✋✌️ **Batu Gunting Kertas** | Play RPS against Dato' Jalal. Win = 24h mercy. | Buy Dato' roti canai |
| 🎲 **Debt Dice** | Roll 2 dice. Higher = more mercy. | Double shame + public announcement |

### 🤖 Agent System (Multi-AI Orchestrator)

```
User Message
    │
    ▼
┌─────────────────────────────────────┐
│         AGENT ORCHESTRATOR          │
│  (routes to the right specialist)   │
└──────┬──────────┬──────────┬────────┘
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│  Dato'   │ │Receipt │ │  Threat  │
│  Jalal   │ │Inspector│ │ Craftsman│
│(default) │ │(verify) │ │(WhatsApp)│
└──────────┘ └────────┘ └──────────┘
       │
       ▼
┌──────────┐
│  Game    │
│  Master  │
│(mini-games)│
└──────────┘
```

---

## 🛠 STACK

```
  ╔═══════════════════════════════════════╗
  ║            KUTIPCREW TECH             ║
  ║     "Bangla power, result power!"     ║
  ╚═══════════════════════════════════════╝

  Runtime:      Bun (cepat macam lightning ⚡)
  Backend:      Hono (kecik molek, minimal)
  Database:     PostgreSQL (besar, lawan habis)
  Frontend:     React 19 + Vite 8 (laju gila babi)
  CSS:          Tailwind v4 (mudah, padu)
  Icons:        Majesticons (Iconify)
  State:        TanStack Query (mantap)
  AI Chat:      Groq — LLaMA 3.3 70B (power!)
  WhatsApp:     Baileys (no browser needed)
  Realtime:     Bun WebSocket (native, zero config)
  Validation:   Zod (ketat, confirm)
  
  ─── PERSISTENCE ───
  
  Semua chat history disimpan dalam PostgreSQL.
  Tak hilang. Tak lari. Dato' Jalal ingat semua.
  "Dato' punya ingatan lagi kuat dari WiFi Unifi!"
```

---

## 🚀 QUICK START (Locally)

### Prerequisites
- [Bun](https://bun.sh/) v1.0+
- PostgreSQL 14+ (must be running)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/nusabyte-my/kutipcrew.git
cd kutipcrew

# Backend
cd api && bun install && cd ..

# Frontend
cd web && bun install && cd ..
```

### 2. Create Database

```bash
psql -U postgres -c "CREATE DATABASE splitbill;"
```

### 3. Configure

```bash
cd api
cp .env.example .env
# Edit .env with your credentials and GROQ_API_KEY
bun run db:init
cd ..
```

### 4. Seed Demo Data (optional but recommended)

```bash
cd api && bun run src/db/seed.ts && cd ..
```

### 5. Run

**Terminal 1 — Backend:**
```bash
cd api && bun run dev
```

**Terminal 2 — Frontend:**
```bash
cd web && bun run dev
```

Buka **http://localhost:5173** — you're ready!

---

## 🎭 DEMO DATA

After seeding, you get **3 bills** with **12 participants** and **full chat histories**:

| Bill | Link | Scenario |
|------|------|----------|
| 🍛 Friday Malam Makan Session | `/bill/demo-makan-01` | Budi ✅ Farid ✅, 3 orang belum bayar |
| 🏸 Badminton Court Booking | `/bill/demo-badminton-02` | OVERDUE — games unlocked, 2 unpaid |
| 🌐 House WiFi Bill - June | `/bill/demo-wifi-03` | All fresh — nobody paid yet |

**To see chats in action:**
1. Open a bill, scroll to "View Chat" for any participant
2. Click "Chat dengan Dato' Jalal" to start a new conversation
3. Say "dah bayar" → Dato' asks for receipt → upload any image → auto-marked PAID

---

## 📁 PROJECT STRUCTURE

```
kutipcrew/
├── api/                          # Hono + Bun backend
│   ├── src/
│   │   ├── index.ts              # HTTP + WebSocket server
│   │   ├── agents/               # Multi-agent AI system
│   │   │   ├── orchestrator.ts   # Central router
│   │   │   ├── datoJalalAgent.ts # Main debt collector
│   │   │   ├── receiptAgent.ts   # Payment verifier
│   │   │   ├── threatAgent.ts    # WhatsApp message crafter
│   │   │   ├── gameMasterAgent.ts# Mini-game referee
│   │   │   └── types.ts          # Agent interfaces + Groq client
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── db/                   # Schema + migrations + seed
│   │   └── types/                # TypeScript types
│   └── package.json
│
├── web/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── pages/                # Page components
│   │   ├── lib/                  # API client + utils
│   │   └── types/                # TypeScript types
│   ├── index.html
│   └── vite.config.ts
│
└── README.md
```

---

## 🔌 API REFERENCE (Untuk Developer)

### Bills
| Method | Endpoint | Apa Dia Buat |
|--------|----------|-------------|
| `POST` | `/api/bills` | Create bill with participants |
| `GET` | `/api/bills` | List semua bills |
| `GET` | `/api/bills/share/:token` | Get bill by share link |
| `PUT` | `/api/bills/:id` | Update bill details |
| `DELETE` | `/api/bills/:id` | Delete bill (gone forever RIP) |

### Participants
| Method | Endpoint | Apa Dia Buat |
|--------|----------|-------------|
| `POST` | `/api/bills/:id/participants` | Add more people to chase |
| `PUT` | `/api/participants/:id/pay` | Mark as PAID (selamat!) |
| `PUT` | `/api/participants/:id/unpay` | Unmark (kenapa ni?) |

### WhatsApp
| Method | Endpoint | Apa Dia Buat |
|--------|----------|-------------|
| `GET` | `/api/whatsapp/qr` | Get QR code for linking |
| `GET` | `/api/whatsapp/status` | Check if WhatsApp is connected |
| `POST` | `/api/whatsapp/send/:billId` | Send threats to unpaid members |
| `POST` | `/api/whatsapp/send-preview` | Preview the threat message |

### Chat (Dato' Jalal AI)
| Method | Endpoint | Apa Dia Buat |
|--------|----------|-------------|
| `POST` | `/api/chat/sessions` | Create chat session |
| `GET` | `/api/chat/bill/:id/participant/:pid` | Get chat history |
| `WS` | `/ws/chat?session=:id` | Real-time chat WebSocket |

---

## 🎨 DESIGN SYSTEM

```
COLORS:
  Black:  #0a0a0a   Everything. Borders. Buttons.
  Red:    #ff0033   Danger. Unpaid. Dato' marah.
  Green:  #00ff66   Paid. Success. Selamat!
  Yellow: #ffcc00   Warning. Almost overdue.
  White:  #ffffff   Cards. Backgrounds.

FONTS:
  Headings:  Impact (bold. dramatic. uppercase.)
  Body:      Courier Prime (macam typewriter gangster)
  Accent:    Comic Sans MS (for comedy value)
  
STYLE RULES:
  ┌───────────────────────────────────────┐
  │ Every border MUST be 4px thick.     │
  │ Every shadow MUST be 8px offset.    │
  │ No rounded corners. EVER.            │
  │ If it doesn't look aggressive,      │
  │ it's not brutalist enough.           │
  └───────────────────────────────────────┘
```

---

## 🚢 DEPLOYMENT (VPS)

```bash
# 1. Build frontend
cd web && bun run build

# 2. Start backend with PM2
cd ../api
pm2 start ~/.bun/bin/bun --name "kutipcrew-api" -- run start

# 3. Configure Nginx for kutipcrew.nusabyte.cloud
#    Serve web/dist as static files
#    Proxy /api/* to localhost:3000
#    Proxy /ws/* to localhost:3000 (WebSocket)
```

**Production requirements:**
- PostgreSQL running on the VPS (or remote)
- `GROQ_API_KEY` in environment
- Nginx with SSL (Let's Encrypt)
- PM2 for process management

---

## 🙏 SHOUTOUTS

- Built for the **Tracker Web App Challenge** by **krackeddev crew bounty**
- Built by **humm1ngb1rd** from **nusabyte.my**
  > *"I started this as a simple bill tracker. Now I have Dato' Jalal running debt collection operations from a mamak stall. This is not what I planned but I'm not complaining."*
- Icons: [Majesticons](https://icon-sets.iconify.design/majesticons/)
- AI: [Groq](https://groq.com/) (LLaMA 3.3 70B — paling padu!)
- WhatsApp: [Baileys](https://github.com/WhiskeySockets/Baileys)
- Inspired by every mamak session where someone "lupa bawa duit"

---

```
Dato' Jalal's Final Words:
─────────────────────────
"Kau dah baca README ni habis-habis.
Sekarang gi bayar hutang.
Atau Dato' datang rumah."
                                                🤌💀

KutipCrew — We collect so you don't have to chase.
```