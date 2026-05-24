# 👥 EmpTrack – Employee Information Management System

A full-stack CRUD application built with **React + Node.js + MySQL**.

---

## 📁 Project Structure

```
employee-mgmt/
├── database/
│   └── schema.sql          ← MySQL schema + sample data
├── backend/
│   ├── config/db.js         ← MySQL connection pool
│   ├── routes/employees.js  ← All CRUD API routes
│   ├── server.js            ← Express server entry point
│   ├── .env.example         ← Environment variables template
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js           ← Main React UI
    │   ├── App.css          ← Styling
    │   ├── index.js         ← React entry point
    │   └── services/api.js  ← Axios API service
    └── package.json
```

---

## ⚙️ Setup & Run Instructions

### Step 1 – MySQL Database
1. Open MySQL Workbench or your terminal.
2. Run the schema file:
   ```sql
   source path/to/employee-mgmt/database/schema.sql;
   ```
   This creates the `employee_db` database, the `employees` table, and inserts 5 sample records.

---

### Step 2 – Backend (Node.js)
```bash
cd employee-mgmt/backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set your DB_PASSWORD

# Start the server
npm start
# OR for development with auto-reload:
npm run dev
```
Server runs at: **http://localhost:5000**

---

### Step 3 – Frontend (React)
```bash
cd employee-mgmt/frontend

# Install dependencies
npm install

# Start the React app
npm start
```
App opens at: **http://localhost:3000**

---

## 🔗 API Endpoints

| Method | Endpoint                       | Description             |
|--------|-------------------------------|-------------------------|
| GET    | /api/employees                | Get all employees       |
| GET    | /api/employees/:id            | Get employee by ID      |
| POST   | /api/employees                | Create new employee     |
| PUT    | /api/employees/:id            | Update employee         |
| DELETE | /api/employees/:id            | Delete employee         |
| GET    | /api/employees/stats/summary  | Dashboard statistics    |
| GET    | /api/health                   | Server health check     |

### Query Parameters (GET /api/employees)
- `search` – search by name or email
- `department` – filter by department
- `status` – filter by Active/Inactive

---

## ✅ Features
- **Create** – Add new employees with full validation
- **Read** – View all employees with search & filter; view individual details
- **Update** – Edit employee information inline
- **Delete** – Delete with confirmation prompt
- Dashboard stats: total, active, inactive, average salary
- Responsive dark-themed UI

---

## 🛠️ Tech Stack
| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18, Axios     |
| Backend   | Node.js, Express    |
| Database  | MySQL 8, mysql2     |
| Styling   | Pure CSS            |
