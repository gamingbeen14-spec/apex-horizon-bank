const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  checkingAcc: { type: String, required: true },
  savingsAcc: { type: String, required: true },
  checkingBalance: { type: Number, default: 0 },
  savingsBalance: { type: Number, default: 0 },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
  accountType: { type: String, enum: ['checking', 'savings'], default: 'checking' },
  description: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, default: 'Settled' }
}, { timestamps: true });

// Service Request Schema
const serviceRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  serviceType: { type: String, required: true },
  details: { type: String, required: true },
  filedDate: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = { User, Transaction, ServiceRequest };
