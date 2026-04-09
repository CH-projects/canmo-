import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./demo.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create users table and seed it
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`, (err) => {
      if (!err) {
        // Only insert admin if it doesn't exist
        db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
          if (!row) {
            db.run("INSERT INTO users (username, password) VALUES ('admin', 'MySecretSuperPassword99!')");
            console.log('Seeded initial admin user.');
          }
        });
      }
    });
  }
});

// DELIBERATELY VULNERABLE LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // IMPORTANT: This is a textbook SQL injection vulnerability!
  // It directly concatenates user input into the query string.
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // Login successful
      console.log('Login successful for user:', row.username);
      res.json({ success: true, user: { username: row.username, id: row.id } });
    } else {
      // Login failed
      console.log('Login failed');
      res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

// Serve the React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use the PORT environment variable if available (standard for Render)
const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Vulnerable backend running at http://localhost:${PORT}`);
});
