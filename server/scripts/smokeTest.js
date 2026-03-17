/**
 * Smoke test for core flows:
 * - Create 2 verified users directly in MongoDB
 * - Generate JWTs
 * - Discover, crush each other, verify match creation
 * - Fetch matches and messages history
 * - Send a message via Socket.io and verify it persists
 *
 * Run:
 *   node scripts/smokeTest.js
 *
 * Requires backend running on localhost:5000
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");

const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");

const API = "http://localhost:5000/api";

const tokenFor = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

async function request(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${data.message || "Request failed"}`);
  return data;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

  await mongoose.connect(process.env.MONGODB_URI);

  // Cleanup any prior smoke users
  await User.deleteMany({ email: { $in: ["smoke1@rgipt.ac.in", "smoke2@rgipt.ac.in"] } });
  await Match.deleteMany({});
  await Message.deleteMany({});

  const hashed = await bcrypt.hash("Password123!", 10);
  const u1 = await User.create({
    name: "Smoke One",
    email: "smoke1@rgipt.ac.in",
    password: hashed,
    branch: "Computer Science",
    year: "2nd Year",
    gender: "male",
    isEmailVerified: true
  });
  const u2 = await User.create({
    name: "Smoke Two",
    email: "smoke2@rgipt.ac.in",
    password: hashed,
    branch: "Chemical Eng.",
    year: "3rd Year",
    gender: "female",
    isEmailVerified: true
  });

  const t1 = tokenFor(u1._id);
  const t2 = tokenFor(u2._id);

  // Discover from u1 should include u2
  const discover = await request("/users/discover", t1);
  if (!Array.isArray(discover.users)) throw new Error("Discover returned invalid users array");
  const foundU2 = discover.users.find((x) => String(x._id || x.id) === String(u2._id));
  if (!foundU2) throw new Error("Discover did not return the other user");

  // Crush u2 from u1 -> pending
  const c1 = await request("/crush", t1, { method: "POST", body: JSON.stringify({ receiverId: String(u2._id) }) });
  if (!c1.success) throw new Error("Crush 1 failed");

  // Crush u1 from u2 -> should match
  const c2 = await request("/crush", t2, { method: "POST", body: JSON.stringify({ receiverId: String(u1._id) }) });
  if (!c2.matched || !c2.match?._id) throw new Error("Mutual crush did not create a match");

  const matchId = String(c2.match._id);

  // Matches list for u1 includes u2
  const matches1 = await request("/matches", t1);
  const m = (matches1.matches || []).find((x) => String(x.id) === matchId);
  if (!m) throw new Error("Matches endpoint missing created match");

  // Socket messaging: join match and send message
  const socket1 = io("http://localhost:5000", { auth: { token: t1 }, transports: ["websocket"] });
  await new Promise((resolve, reject) => {
    socket1.on("connect", resolve);
    socket1.on("connect_error", (err) => reject(err));
  });
  socket1.emit("join_match", matchId);

  const sentText = `hello-${Date.now()}`;
  socket1.emit("send_message", { matchId, message: sentText });

  // Wait a bit for persistence
  await new Promise((r) => setTimeout(r, 500));
  socket1.disconnect();

  // Messages history should include the sent message
  const msgs = await request(`/messages/${matchId}`, t1);
  const has = (msgs.messages || []).some((mm) => mm.message === sentText);
  if (!has) throw new Error("Message not found in history after socket send");

  // eslint-disable-next-line no-console
  console.log("SMOKE TEST PASSED");

  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("SMOKE TEST FAILED:", err.message);
  process.exit(1);
});

