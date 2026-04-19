import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import process from "node:process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "demo.db");
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123"; // ✅ Single source of truth for password

const app = express();
const port = 3001;
let employeeTitleColumn = "role";

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // HTTP only — intentionally vulnerable for demo
      httpOnly: false, // Allows JS to read cookie — intentionally vulnerable for demo
    },
  }),
);

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}.`);

    // Create users table and seed it
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table", err.message);
        } else {
          console.log("Users table ready.");

          db.run(
            `INSERT INTO users (username, password)
             VALUES (?, ?)
             ON CONFLICT(username) DO UPDATE SET password = excluded.password`,
            [DEMO_USERNAME, DEMO_PASSWORD],
            (err) => {
              if (err) {
                console.error("Error seeding admin user", err.message);
              } else {
                console.log(
                  `Ensured demo admin user is available for ${DEMO_USERNAME}.`,
                );
              }
            },
          );
        }
      },
    );

    // Create employees table
    db.run(
      `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        salary REAL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating employees table", err.message);
        } else {
          console.log("Employees table ready.");

          db.all("PRAGMA table_info(employees)", (err, columns) => {
            if (err) {
              console.error("Error reading employees schema", err.message);
              return;
            }

            const columnNames = columns.map((column) => column.name);
            employeeTitleColumn = columnNames.includes("role")
              ? "role"
              : "position";

            // Seed employees only if table is empty
            db.get("SELECT COUNT(*) AS count FROM employees", (err, row) => {
              if (err) {
                console.error("Error checking employee count", err.message);
              } else if (row.count === 0) {
                const insertEmployee = db.prepare(
                  `INSERT INTO employees (name, department, ${employeeTitleColumn}, salary) VALUES (?, ?, ?, ?)`,
                );

                const sampleEmployees = [
                  ["John Perera", "IT", "Software Engineer", 85000],
                  ["Nimali Silva", "Human Resources", "HR Manager", 78000],
                  ["Kasun Fernando", "Finance", "Accountant", 72000],
                  ["Sahan Jayasinghe", "IT", "Network Administrator", 80000],
                  ["Dilini Rodrigo", "Marketing", "Marketing Executive", 67000],
                  ["Amaya Peris", "Operations", "Project Coordinator", 69000],
                ];

                sampleEmployees.forEach((employee) => {
                  insertEmployee.run(employee, (err) => {
                    if (err) {
                      console.error("Error inserting employee", err.message);
                    }
                  });
                });

                insertEmployee.finalize((err) => {
                  if (err) {
                    console.error(
                      "Error finalizing employee seed",
                      err.message,
                    );
                  } else {
                    console.log("Seeded initial employee records.");
                  }
                });
              } else {
                console.log("Employees table already contains data.");
              }
            });
          });
        }
      },
    );
  }
});

// ✅ FIXED — password now matches DEMO_PASSWORD (admin123)
const handleDemoLogin = (req, res) => {
  const { username, password } = req.body;

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    req.session.user = username;
    return res.json({
      success: true,
      message: "Logged in successfully!",
      user: username,
    });
  }

  res.status(401).json({ success: false, error: "Invalid credentials" });
};

// DELIBERATELY VULNERABLE SESSION-BASED LOGIN ENDPOINT
app.post("/login", handleDemoLogin);

// Keep the original demo API route available for the frontend
app.post("/api/login", handleDemoLogin);

app.get("/api/session", (req, res) => {
  if (req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }

  res.status(401).json({ authenticated: false });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err.message);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// GET all employees
app.get("/api/employees", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
});

// POST a new employee
app.post("/api/employees", (req, res) => {
  const { name, department, role, position, salary } = req.body;
  const employeeTitle = role || position;

  if (!name || !department || !employeeTitle) {
    return res
      .status(400)
      .json({ error: "Name, department, and role are required" });
  }

  const query = `INSERT INTO employees (name, department, ${employeeTitleColumn}, salary) VALUES (?, ?, ?, ?)`;

  db.run(query, [name, department, employeeTitle, salary], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      success: true,
      employee: {
        id: this.lastID,
        name,
        department,
        role: employeeTitle,
        salary,
      },
    });
  });
});

app.use(express.static(path.join(__dirname, "dist")));

// Serve the React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
