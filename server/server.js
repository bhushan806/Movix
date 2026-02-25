import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";

// Load .env only in development (Render provides env vars in production)
dotenv.config();

const app = express();

// ── Track DB state ────────────────────────────────────────────────────────────
let dbConnected = false;

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
    : [];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (e.g. mobile apps, curl, Render healthcheck)
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Root Route (required by Render port detection) ───────────────────────────
app.get("/", (_req, res) => {
    res.send("Server is running");
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: dbConnected ? "OK" : "DEGRADED",
        service: "TruckNet India Backend",
        database: dbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

// ── Routes (add your route imports here) ─────────────────────────────────────
// import authRoutes from "./routes/auth.js";
// app.use("/api/auth", authRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

// ── Start Server FIRST, then connect DB ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

// ── MongoDB Connection (non-blocking) ────────────────────────────────────────
async function connectDB() {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.warn("WARNING: MONGO_URI is not set. Running without database.");
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        dbConnected = true;
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        // Do NOT exit — let Render keep the process alive so it can retry or show health status
    }
}