import "dotenv/config";
import express from "express";
import cors from "cors";
import { me } from "./routes/me"; 
import { brokerRouter } from "./routes/broker";


const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const allowed = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map(s => s.trim());

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, origin);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

app.get("/healthz", (_req, res) => res.send("ok"));
app.use("/api/me", me);
app.use("/api/broker", brokerRouter)

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
