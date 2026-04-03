const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin password for viewing submissions
const ADMIN_PASS = process.env.ADMIN_PASS || 'RGBY2026!';

// Email config (Outlook/M365)
const EMAIL_TO = process.env.EMAIL_TO || 'paul@rgby.ai';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rgby.ai';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp-mail.outlook.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Send notification email
async function sendNotification(subject, body) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('SMTP not configured — skipping email. Subject:', subject);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"RGBY.ai Website" <${EMAIL_FROM}>`,
      to: EMAIL_TO,
      subject: subject,
      html: body,
    });
    console.log('Notification sent:', subject);
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

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

  // Send notification
  sendNotification(
    `New waitlist signup: ${email}`,
    `<h2 style="color:#34C759;">New Waitlist Signup</h2>
     <p><strong>Email:</strong> ${email}</p>
     <p><strong>Date:</strong> ${new Date().toISOString()}</p>
     <p><strong>Total on waitlist:</strong> ${list.length}</p>
     <hr>
     <p style="color:#888;font-size:12px;">RGBY.ai Website Notification</p>`
  );

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

  // Send notification
  sendNotification(
    `New contact: ${subject || 'No subject'} — from ${name}`,
    `<h2 style="color:#3B82F6;">New Contact Message</h2>
     <p><strong>Name:</strong> ${name}</p>
     <p><strong>Email:</strong> ${email}</p>
     <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
     <p><strong>Message:</strong></p>
     <blockquote style="border-left:3px solid #3B82F6;padding-left:12px;color:#ccc;">${message}</blockquote>
     <p><strong>Date:</strong> ${new Date().toISOString()}</p>
     <hr>
     <p style="color:#888;font-size:12px;">RGBY.ai Website Notification</p>`
  );

  res.json({ message: 'Message received' });
});

// View submissions (password protected)
app.get('/api/submissions', (req, res) => {
  const pass = req.query.pass;
  if (pass !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorised. Use ?pass=YOUR_PASSWORD' });
  }

  const waitlistFile = path.join(DATA_DIR, 'waitlist.json');
  const contactsFile = path.join(DATA_DIR, 'contacts.json');

  const waitlist = fs.existsSync(waitlistFile) ? JSON.parse(fs.readFileSync(waitlistFile, 'utf8')) : [];
  const contacts = fs.existsSync(contactsFile) ? JSON.parse(fs.readFileSync(contactsFile, 'utf8')) : [];

  res.json({ waitlist_count: waitlist.length, contact_count: contacts.length, waitlist, contacts });
});

// Clean URL routing — serve index.html from matching directory
app.get('*', (req, res) => {
  const cleanPath = req.path.replace(/\/+$/, '') || '/';
  const filePath = path.join(__dirname, 'public', cleanPath, 'index.html');

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // 404 — serve homepage as fallback
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RGBY website running on port ${PORT}`);
});
