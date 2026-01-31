# Movix - TruckNet India 🚛 🇮🇳

**Movix** is a Next-Gen AI-Powered Logistics Platform tailored for the Indian transportation market. It connects Fleet Owners, Drivers, and Transporters in a unified ecosystem with real-time tracking, AI-driven load matching, and financial management.

![Status](https://img.shields.io/badge/Status-Development-blue) ![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Python-green) ![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🚀 Key Features

### 🏢 Fleet Owner Dashboard
- **Real-Time Fleet Tracking**: Live GPS tracking of vehicles on an interactive map.
- **AI Smart Matching**: Automatically finds the best drivers for a load based on proximity, rating, and vehicle type.
- **Finance & Compliance**: Track revenue, expenses, and manage vehicle documents (RC, Insurance) with real file uploads.
- **Vehicle Management**: Add, edit, and maintain vehicle status (Active/Maintenance/On-Trip).

### 🤖 AI Engine (Microservice)
- **Smart Load Matching**: Uses a Weighted Scoring algorithm (Proximity 40%, Capacity 30%, Rating 20%) to rank drivers.
- **Route Optimization**: A* Algorithm optimized for Indian roads (considers Fuel, Time, and "Road Quality").
- **Dynamic Pricing**: ML-based price prediction using City Base Rates + Real-time Demand Surge.

### 📱 Driver Experience (Planned)
- Mobile-first interface for accepting loads.
- Turn-by-turn navigation.

---

## 🛠️ Tech Stack

This project is a **Monorepo** managed with `TurboRepo`.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 16, TailwindCSS v4 | "Aurora Glass" 3D UI, Leaflet Maps, Shadcn UI |
| **Backend** | Node.js, Express, Mongoose | REST API, Socket.io for Real-time updates |
| **AI Engine** | Python, FastAPI | Scikit-Learn, NetworkX for Optimization |
| **Database** | MongoDB & PostgreSQL | Hybrid storage for flexible documents & structured relations |

---

## 📂 Project Structure

```bash
├── apps
│   ├── web          # Next.js Frontend (Dashboard, Landings)
│   ├── api          # Node.js/Express Backend (Auth, Vehicles, Loads)
│   └── ai_engine    # Python FastAPI Service (Matching, Routing)
├── packages         # Shared UI/Configs (if applicable)
└── README.md        # This file
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.8+
- **MongoDB**: Local or Atlas URI
- **PostgreSQL**: Local or Cloud URI

### 2. Environment Setup

Create `.env` files in `apps/api` and `apps/web`.

**Backend (`apps/api/.env`)**
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/trucknet"
MONGO_URI="mongodb://localhost:27017/trucknet"
JWT_SECRET="your_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret"
NODE_ENV="development"
```

**Frontend (`apps/web/.env.local`)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

### 3. Installation

Run this command in the root directory to install dependencies for all apps:

```bash
npm install
```

### 4. Running the Project

Start all services (Frontend, Backend, AI Engine) in parallel:

```bash
npm run dev
```

> **Note**: This uses TurboRepo to run `dev` scripts in all workspaces.
> - **Web**: http://localhost:3000
> - **API**: http://localhost:5000
> - **AI Engine**: http://localhost:8000

---

## 🧠 AI Microservice Details

The AI Engine is a standalone Python service located in `apps/ai_engine`.

- **Setup**:
  ```bash
  cd apps/ai_engine
  pip install -r requirements.txt
  python main.py
  ```
- **Key Endpoints**:
  - `POST /match`: Returns sorted list of best drivers for a load.
  - `POST /route`: Calculates optimal path avoiding bad roads.
  - `POST /predict-price`: Estimates trip cost based on demand.

---



---

## 🤝 Contributing

1. Fork the repo.
2. Create feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add AmazingFeature'`).
4. Push to branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Built with ❤️ for India by Bhushan Patil**
