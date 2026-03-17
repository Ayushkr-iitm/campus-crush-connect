require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Socket.io setup
initSocket(server);

// Database
connectDB();

// Middleware
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl/postman) and same-origin
      if (!origin) return callback(null, true);

      // Explicit allow list from env
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (allowedOrigins.length && allowedOrigins.includes(origin)) return callback(null, true);

      // Dev convenience: allow localhost on any port
      if (process.env.NODE_ENV !== "production") {
        try {
          const url = new URL(origin);
          if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            return callback(null, true);
          }
        } catch (_) {
          // ignore
        }
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Campus Crush API running" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/crush", require("./routes/crushRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

