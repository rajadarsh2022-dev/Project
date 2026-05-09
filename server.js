const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Database
const db = new sqlite3.Database('iot.db');

// Init DB
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS sensor_data (id INTEGER PRIMARY KEY, temp REAL, hum REAL, soil REAL, timestamp TEXT)`);
  db.run(`ALTER TABLE sensor_data ADD COLUMN soil REAL`, (err) => {
    // ignore error if column already exists
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, password], (err) => {
    if (err) {
      return res.send('Error registering');
    }
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (err || !row) {
      return res.send('Invalid login');
    }
    res.cookie('user', row.name);
    res.redirect('/dashboard');
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.cookies.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/latest-data', (req, res) => {
  db.get(`SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1`, (err, row) => {
    if (err || !row) {
      return res.json({ temp: 'N/A', hum: 'N/A', soil: 'N/A', time: 'N/A', date: 'N/A' });
    }
    const dateObj = new Date(row.timestamp);
    const time = dateObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    const date = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    res.json({ temp: row.temp + " 'C", hum: row.hum + ' %', soil: (row.soil !== null && row.soil !== undefined ? row.soil + ' %' : 'N/A'), time, date });
  });
});

app.get('/api/all-data', (req, res) => {
  db.all(`SELECT * FROM sensor_data ORDER BY id DESC`, (err, rows) => {
    if (err) {
      return res.json([]);
    }
    const data = rows.map((row, index) => {
      const dateObj = new Date(row.timestamp);
      const time = dateObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      const date = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      return { id: row.id, num: index + 1, temp: row.temp + " 'C", hum: row.hum + ' %', soil: (row.soil !== null && row.soil !== undefined ? row.soil + ' %' : 'N/A'), time, date, rawSoil: row.soil };
    });
    res.json(data);
  });
});

app.post('/save-lcd-text', (req, res) => {
  const { text } = req.body;
  if (text.length > 16) {
    return res.send('Text too long');
  }
  fs.writeFileSync('lcd.txt', text);
  res.redirect('/dashboard');
});

app.get('/get-lcd-text', (req, res) => {
  if (fs.existsSync('lcd.txt')) {
    const text = fs.readFileSync('lcd.txt', 'utf8');
    res.send(text);
  } else {
    res.send('No text');
  }
});

app.get('/save-data', (req, res) => {
  const { temp, hum, soil } = req.query;
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO sensor_data (temp, hum, soil, timestamp) VALUES (?, ?, ?, ?)`, [parseFloat(temp), parseFloat(hum), parseFloat(soil), timestamp], (err) => {
    if (err) {
      return res.send('Error');
    }
    res.send('OK');
  });
});

app.post('/delete-data/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM sensor_data WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.send('Error');
    }
    res.redirect('/dashboard');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});