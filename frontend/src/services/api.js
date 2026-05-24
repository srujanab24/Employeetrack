import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Employee API ───────────────────────────────────────────
export const employeeAPI = {
  // Fetch all (with optional filters)
  getAll: (params = {}) => api.get("/employees", { params }),

  // Fetch one by ID
  getById: (id) => api.get(`/employees/${id}`),

  // Create
  create: (data) => api.post("/employees", data),

  // Update
  update: (id, data) => api.put(`/employees/${id}`, data),

  // Delete
  remove: (id) => api.delete(`/employees/${id}`),

  // Dashboard stats
  getStats: () => api.get("/employees/stats/summary"),
};

export default api;
