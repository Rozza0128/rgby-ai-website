const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Waitlist signup
app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const file = path.join(DATA_DIR, 'waitlist.json');
  const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];

  if (list.some(e => e.email === email)) {
    return res.json({ message: 'Already on the waitlist', count: list.length });
  }

  list.push({ email, date: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  res.json({ message: 'Added to waitlist', count: list.length });
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message required' });
  }

  const file = path.join(DATA_DIR, 'contacts.json');
  const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];

  list.push({ name, email, subject, message, date: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  res.json({ message: 'Message received' });
});

// View submissions (simple admin — add auth later)
app.get('/api/submissions', (req, res) => {
  const waitlistFile = path.join(DATA_DIR, 'waitlist.json');
  const contactsFile = path.join(DATA_DIR, 'contacts.json');

  const waitlist = fs.existsSync(waitlistFile) ? JSON.parse(fs.readFileSync(waitlistFile, 'utf8')) : [];
  const contacts = fs.existsSync(contactsFile) ? JSON.parse(fs.readFileSync(contactsFile, 'utf8')) : [];

  res.json({ waitlist, contacts });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RGBY website running on port ${PORT}`);
});
