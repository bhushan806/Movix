# 🚛 TruckNet AI — Predictive Supply Chain Intelligence System

> **Transforming logistics from a reactive process into a proactive, self-optimizing network, while empowering the human driver.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green?logo=mongodb)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Architecture](#-the-architecture)
- [Key Features by Role](#-key-features-by-role)
- [AI & Predictive Intelligence](#-ai--predictive-intelligence)
- [Tech Stack](#-tech-stack)
- [Security & Production Readiness](#-security--production-readiness)
- [Getting Started](#-getting-started)
- [Deployment Guide](#-deployment-guide)

---

## 🌟 Overview

Current logistics systems are highly reactive—treating delays, accidents, and inefficiencies after they occur. **TruckNet AI** shifts the paradigm to a **proactive intelligence model**, employing a "Predict → Detect → Decide → Act" pipeline to optimize supply chains across India. 

Moreover, TruckNet AI introduces a dedicated **Driver Intelligence Layer** that evolves the system from merely optimizing logistics to empowering the human operator—improving safety, earnings transparency, and reducing mental fatigue.

---

## 🏗 The Architecture

TruckNet AI follows a modern, multi-layered architecture focused on real-time intelligence and strict role isolation.

```text
1. Data Layer (Telemetry, Weather, Market Data)
        ⬇
2. Prediction Layer (Risk, Demand, Heatmaps)
        ⬇
3. Decision Layer (Auto-rerouting, Load Matching)
        ⬇
4. Action Layer (Automated dispatch, Alerts)
        ⬇
5. Driver Intelligence Layer (Fatigue monitoring, Filtered alerts, SOS)
        ⬇
6. Interaction Layer (TruckNet Dost AI Assistant, Role-based Dashboards)
```

**System Isolation:** Data and AI interactions are strictly role-gated. A Customer cannot access Owner data; a Driver cannot view Customer pricing, and chat memories for the AI assistant are fully isolated per user.

---

## 👥 Key Features by Role

### 👨‍✈️ Driver (The Intelligent Operator)
- **AI Co-Driver:** Real-time voice/text guidance. Filters complex data into simple alerts (e.g., "Heavy rain ahead, reducing route speed").
- **Fatigue & Stress Detection:** Monitors driving hours and time-of-day. Suggests dynamic rest stops (Dhabas, secure parking) mapped to route requirements.
- **Earnings Transparency:** Connects owner payment data to the driver view, showing trip value and exact driver cuts to prevent exploitation.
- **Safety First:** Global SOS trigger with instant location sharing.

### 🚚 Fleet Owner
- **Live Fleet Tracking:** Monitor 100% of fleet assets with status (On-trip, Maintenance, Available).
- **Predictive Maintenance:** AI-flagged alerts before breakdowns occur (e.g., unexpected fuel drops).
- **Financial Analytics:** Live dashboard showing revenue growth, trip efficiency, and automated accounting.
- **Smart Load Bidding:** AI suggests profitable loads based on returning empty trucks (reducing deadhead miles).

### 🏭 Customer (SME/Factory)
- **Proactive Tracking:** Post loads and track them seamlessly.
- **Predictive ETAs:** Not just when it will arrive, but *why* it might be delayed.
- **Load Escrow (Planned):** Secure payment integrations ensuring trust between owner and customer.

---

## 🧠 AI & Predictive Intelligence

TruckNet AI features a sophisticated multi-provider LLM chain and predictive engines.

### 1. TruckNet Dost (Multi-LLM Assistant)
- Uses a fallback chain for 100% uptime: **Groq (Llama 3, Fastest) → Ollama (Local) → HuggingFace (Mistral) → Hindi Fallback.**
- Context-aware: Chatbot knows who is speaking (Driver vs Owner) and tailors answers instantly.

### 2. Predictive Engines
- **Risk Engine:** Analyzes weather, traffic, and driver history to assign risk scores to active shipments.
- **Decision Engine:** Automatically suggests re-routing or rest stops if risk exceeds thresholds.
- **Network Intelligence:** Live heatmaps of national supply chain congestion. 

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **Database** | MongoDB 7+ (Mongoose) |
| **AI Processing**| Groq, HuggingFace APIs, Python FastAPI (Backend Engine) |
| **Security** | JWT (With Refresh Rotation), bcrypt, Helmet, Zod Validation |

---

## 🔒 Security & Production Readiness

The platform has been audited and battle-tested for real-world deployments:
- **Zero Unprotected Routes:** All AI endpoints, predictive routes, and data mutations are strictly protected by JWT middleware.
- **Crash Safety:** Process-level `unhandledRejection` and `uncaughtException` handlers ensure silent crashes never occur.
- **Environment Safety:** Strict Zod validation on boot; the server refuses to start without necessary secrets.
- **Rate Limiting:** IP-based sliding window rate-limiting for auth and status updates to prevent brute force and DDoS.
- **Optimized UI:** SSR-safe Next.js implementation with skeleton loaders, optimistic UI, and error boundaries.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **MongoDB** 7+ (Local or Atlas)
- **API Keys**: Groq (Optional but recommended)

### 1. Installation

```bash
git clone https://github.com/YOUR_USERNAME/trucknet-india.git
cd trucknet-india

# Install dependencies
npm install
cd apps/api && npm install
cd ../web && npm install
```

### 2. Environment Variables
Duplicate `.env.example` in `apps/api/` to `.env` and fill the variables:

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

In `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run the Platform

```bash
# Start MongoDB locally (if not using Atlas)
mongod --dbpath /data/db --replSet rs0

# Run both Web & API from root
npm run dev
```

---

## ☁️ Deployment Guide

### Backend (Render / Railway)
1. **Build Command**: `cd apps/api && npm install && npm run build`
2. **Start Command**: `cd apps/api && node dist/app.js`
3. Add all Environment Variables (`DATABASE_URL`, `PORT`, `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN=https://your-frontend.vercel.app`).

### Frontend (Vercel)
1. **Framework Preset**: Next.js
2. **Root Directory**: `apps/web`
3. **Environment Variable**: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

---

<p align="center">
  Built with ❤️ to upgrade India's logistics ecosystem.
</p>
