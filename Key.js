import mongoose from "mongoose";

const KeySchema = new mongoose.Schema({
  key: String,
  ip: String,
  duration: Number,
  createdAt: { type: Number, default: Date.now },
  expiresAt: Number,
  status: { type: String, default: "active" },
  usedByIP: String,
  usedAt: Number
});

export default mongoose.model("Key", KeySchema);
