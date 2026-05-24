const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ─────────────────────────────────────────────
// GET /api/employees  — Fetch all employees
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = "SELECT * FROM employees WHERE 1=1";
    const params = [];

    if (department) {
      query += " AND department = ?";
      params.push(department);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await db.execute(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/employees/:id  — Fetch single employee
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM employees WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/employees  — Create new employee
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      designation,
      salary,
      date_of_joining,
      status,
    } = req.body;

    // Basic validation
    if (
      !first_name ||
      !last_name ||
      !email ||
      !department ||
      !designation ||
      !salary ||
      !date_of_joining
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be filled" });
    }

    const [result] = await db.execute(
      `INSERT INTO employees 
        (first_name, last_name, email, phone, department, designation, salary, date_of_joining, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        department,
        designation,
        salary,
        date_of_joining,
        status || "Active",
      ]
    );

    const [newEmp] = await db.execute("SELECT * FROM employees WHERE id = ?", [
      result.insertId,
    ]);
    res
      .status(201)
      .json({
        success: true,
        message: "Employee created successfully",
        data: newEmp[0],
      });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/employees/:id  — Update employee
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      designation,
      salary,
      date_of_joining,
      status,
    } = req.body;

    // Check employee exists
    const [existing] = await db.execute(
      "SELECT id FROM employees WHERE id = ?",
      [req.params.id]
    );
    if (existing.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    await db.execute(
      `UPDATE employees SET
        first_name=?, last_name=?, email=?, phone=?, department=?,
        designation=?, salary=?, date_of_joining=?, status=?
       WHERE id=?`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        department,
        designation,
        salary,
        date_of_joining,
        status,
        req.params.id,
      ]
    );

    const [updated] = await db.execute(
      "SELECT * FROM employees WHERE id = ?",
      [req.params.id]
    );
    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updated[0],
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/employees/:id  — Delete employee
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await db.execute(
      "SELECT id FROM employees WHERE id = ?",
      [req.params.id]
    );
    if (existing.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    await db.execute("DELETE FROM employees WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/employees/stats/summary  — Dashboard stats
// ─────────────────────────────────────────────
router.get("/stats/summary", async (req, res) => {
  try {
    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) as total FROM employees"
    );
    const [[{ active }]] = await db.execute(
      "SELECT COUNT(*) as active FROM employees WHERE status='Active'"
    );
    const [[{ avg_salary }]] = await db.execute(
      "SELECT ROUND(AVG(salary), 2) as avg_salary FROM employees"
    );
    const [departments] = await db.execute(
      "SELECT department, COUNT(*) as count FROM employees GROUP BY department"
    );

    res.json({
      success: true,
      data: { total, active, inactive: total - active, avg_salary, departments },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
