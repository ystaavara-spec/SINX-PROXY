import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Key from "./models/Key.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.post("/generate-key", async (req, res) => {
  const { ip, duration } = req.body;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "SINX_";
  for (let i = 0; i < 4; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }

  const now = Date.now();
  const expiresAt = now + duration * 24 * 60 * 60 * 1000;

  const newKey = await Key.create({
    key,
    ip,
    duration,
    expiresAt,
    status: "active"
  });

  res.json(newKey);
});

app.post("/validate-key", async (req, res) => {
  const { key, ip } = req.body;

  const found = await Key.findOne({ key });

  if (!found) return res.json({ ok: false, msg: "Key not found" });

  if (found.ip !== ip) return res.json({ ok: false, msg: "IP not allowed" });

  if (Date.now() > found.expiresAt)
    return res.json({ ok: false, msg: "Key expired" });

  found.status = "used";
  found.usedByIP = ip;
  found.usedAt = Date.now();
  await found.save();

  res.json({ ok: true, data: found });
});

app.get("/keys", async (req, res) => {
  const keys = await Key.find();
  res.json(keys);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
