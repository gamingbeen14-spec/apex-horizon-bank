require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { User, Transaction, ServiceRequest } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Seed Default Data
const DEFAULT_BANK_DATA = {
  users: [
    {
      id: 'usr_001',
      username: 'jane',
      password: '1234',
      fullName: 'Jane Sterling',
      role: 'customer',
      email: 'jane.sterling@horizonbank.com',
      phone: '+91 98200 98200',
      checkingAcc: '1002348911',
      savingsAcc: '2009849920',
      checkingBalance: 14250.75,
      savingsBalance: 48900.20,
      joinedDate: '2023-04-12'
    },
    {
      id: 'usr_002',
      username: 'alex',
      password: '1234',
      fullName: 'Alex Reynolds',
      role: 'customer',
      email: 'alex.reynolds@horizonbank.com',
      phone: '+91 98765 43210',
      checkingAcc: '1009182341',
      savingsAcc: '2004551299',
      checkingBalance: 6840.50,
      savingsBalance: 18500.00,
      joinedDate: '2023-09-18'
    },
    {
      id: 'usr_003',
      username: 'admin',
      password: 'admin',
      fullName: 'Chief Officer Morgan Vance',
      role: 'admin',
      email: 'admin.vance@horizonbank.com',
      phone: '+91 98200 12345',
      checkingAcc: '0000000001',
      savingsAcc: '0000000002',
      checkingBalance: 0,
      savingsBalance: 0,
      joinedDate: '2020-01-01'
    }
  ],
  transactions: [
    {
      id: 'TXN-894101',
      userId: 'usr_001',
      date: '2026-10-12 14:22',
      timestamp: Date.now() - 86400000,
      accountType: 'checking',
      description: 'Payroll Direct Deposit - Acme Corp',
      type: 'credit',
      amount: 4500.00,
      balanceAfter: 14250.75,
      status: 'Settled'
    },
    {
      id: 'TXN-894098',
      userId: 'usr_001',
      date: '2026-10-10 09:15',
      timestamp: Date.now() - (86400000 * 3),
      accountType: 'checking',
      description: 'Online Wire to Vanguard Investments',
      type: 'debit',
      amount: 1200.00,
      balanceAfter: 9750.75,
      status: 'Settled'
    },
    {
      id: 'TXN-894050',
      userId: 'usr_001',
      date: '2026-10-08 18:30',
      timestamp: Date.now() - (86400000 * 5),
      accountType: 'savings',
      description: 'Monthly High-Yield Interest Payment',
      type: 'credit',
      amount: 195.40,
      balanceAfter: 48900.20,
      status: 'Settled'
    },
    {
      id: 'TXN-894012',
      userId: 'usr_001',
      date: '2026-10-05 11:04',
      timestamp: Date.now() - (86400000 * 8),
      accountType: 'checking',
      description: 'Whole Foods Market POS Debit',
      type: 'debit',
      amount: 142.80,
      balanceAfter: 10950.75,
      status: 'Settled'
    },
    {
      id: 'TXN-893991',
      userId: 'usr_002',
      date: '2026-10-11 16:40',
      timestamp: Date.now() - (86400000 * 2),
      accountType: 'checking',
      description: 'Consulting Retainer - Tech Labs',
      type: 'credit',
      amount: 3200.00,
      balanceAfter: 6840.50,
      status: 'Settled'
    }
  ],
  serviceRequests: [
    {
      id: 'REQ-1049',
      userId: 'usr_001',
      userName: 'Jane Sterling',
      serviceType: 'Credit Card',
      details: 'Apex Platinum Rewards ($15k) | Income: $115,000 | Full-Time Employed',
      filedDate: '2026-10-11 10:20',
      timestamp: Date.now() - 172800000,
      status: 'pending'
    },
    {
      id: 'REQ-1048',
      userId: 'usr_001',
      userName: 'Jane Sterling',
      serviceType: 'Chequebook',
      details: '50 Leaves (Commercial) | 742 Evergreen Terrace, Springfield, IL',
      filedDate: '2026-10-09 14:05',
      timestamp: Date.now() - (172800000 * 2),
      status: 'approved'
    },
    {
      id: 'REQ-1047',
      userId: 'usr_002',
      userName: 'Alex Reynolds',
      serviceType: 'Credit Card',
      details: 'Horizon Sapphire Infinite ($30k) | Income: $140,000 | Self-Employed',
      filedDate: '2026-10-12 11:55',
      timestamp: Date.now() - 7200000,
      status: 'pending'
    }
  ]
};

async function seedDatabaseIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial bank data to MongoDB...');
    await User.insertMany(DEFAULT_BANK_DATA.users);
    await Transaction.insertMany(DEFAULT_BANK_DATA.transactions);
    await ServiceRequest.insertMany(DEFAULT_BANK_DATA.serviceRequests);
    console.log('Database successfully seeded!');
  }
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Full state sync (compatible with current app architecture)
app.get('/api/data', async (req, res) => {
  try {
    const users = await User.find({}, '-__v -_id');
    const transactions = await Transaction.find({}, '-__v -_id').sort({ timestamp: -1 });
    const serviceRequests = await ServiceRequest.find({}, '-__v -_id').sort({ timestamp: -1 });
    res.json({ users, transactions, serviceRequests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync full state from frontend
app.post('/api/data/sync', async (req, res) => {
  try {
    const { users, transactions, serviceRequests } = req.body;
    if (users && Array.isArray(users)) {
      for (const u of users) {
        await User.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
    }
    if (transactions && Array.isArray(transactions)) {
      for (const t of transactions) {
        await Transaction.findOneAndUpdate({ id: t.id }, t, { upsert: true, new: true });
      }
    }
    if (serviceRequests && Array.isArray(serviceRequests)) {
      for (const s of serviceRequests) {
        await ServiceRequest.findOneAndUpdate({ id: s.id }, s, { upsert: true, new: true });
      }
    }
    res.json({ success: true, message: 'Database updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send OTP via MiniMoth API (WhatsApp/SMS)
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Clean phone number format: ensure + or digits
    let cleaned = phone.replace(/[\s\(\)\-]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    const apiKey = process.env.MINIMOTH_API_KEY || 'mm_live_127c4b17177d96b98bf9ad021790ca02ccd52166b6e25f5e8157f6b5b3891d77b2038058d8afeb7bdf84e6f7addb4453';

    try {
      const response = await fetch('https://api.minimoth.dev/v1/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        },
        body: JSON.stringify({ phone: cleaned })
      });

      const data = await response.json();

      if (response.ok) {
        return res.json({
          success: true,
          mode: 'live',
          phone: cleaned,
          message: data.message || 'OTP sent successfully via WhatsApp/SMS',
          otp_id: data.otp_id,
          expires_at: data.expires_at
        });
      } else {
        console.warn('MiniMoth API responded with error:', data);
        // Fallback for demonstration / non-supported regions
        const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
        return res.json({
          success: true,
          mode: 'demo_fallback',
          phone: cleaned,
          demoOtp: demoOtp,
          message: data.error || 'Simulated OTP delivered (Demo Mode)',
          originalError: data.error
        });
      }
    } catch (networkErr) {
      console.warn('MiniMoth network error:', networkErr.message);
      const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return res.json({
        success: true,
        mode: 'demo_fallback',
        phone: cleaned,
        demoOtp: demoOtp,
        message: 'Network offline. Simulated OTP generated for demo.',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP via MiniMoth API
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { phone, code, demoOtp } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone and 6-digit OTP code are required' });
    }

    let cleaned = phone.replace(/[\s\(\)\-]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    // If demoOtp was passed and matches, accept it
    if (demoOtp && code.trim() === demoOtp.trim()) {
      return res.json({ success: true, verified: true, mode: 'demo_fallback', message: 'Demo OTP verified successfully' });
    }

    // Default universal demo code '123456' for seamless testing
    if (code.trim() === '123456') {
      return res.json({ success: true, verified: true, mode: 'demo_bypass', message: 'Demo master OTP verified' });
    }

    const apiKey = process.env.MINIMOTH_API_KEY || 'mm_live_127c4b17177d96b98bf9ad021790ca02ccd52166b6e25f5e8157f6b5b3891d77b2038058d8afeb7bdf84e6f7addb4453';

    const response = await fetch('https://api.minimoth.dev/v1/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({ phone: cleaned, code: code.trim() })
    });

    const data = await response.json();

    if (response.ok) {
      return res.json({
        success: true,
        verified: true,
        mode: 'live',
        session: data,
        message: 'Phone verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        error: data.error || 'Invalid OTP code. Please try again.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset database to initial seed

app.post('/api/data/reset', async (req, res) => {
  try {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await ServiceRequest.deleteMany({});
    await User.insertMany(DEFAULT_BANK_DATA.users);
    await Transaction.insertMany(DEFAULT_BANK_DATA.transactions);
    await ServiceRequest.insertMany(DEFAULT_BANK_DATA.serviceRequests);
    res.json({ success: true, message: 'Database reset to default seed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB & Start Server
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas successfully.');
    await seedDatabaseIfEmpty();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting server in fallback mode (serves frontend, ready for valid URI in .env)...');
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT} (Database pending connection)`);
    });
  });
