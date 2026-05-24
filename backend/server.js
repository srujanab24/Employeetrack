const express = require("express");
const cors = require("cors");
require("dotenv").config();

const employeeRoutes = require("./routes/employees");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────
app.use("/api/employees", employeeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Employee Management API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
