

const STORAGE_KEY = 'apex_horizon_bank_v1';

// Seed Initial Mock Database
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
      status: 'pending' // pending | approved | rejected
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

// Application State
let appData = null;
let currentUser = null;
let activePortal = 'customer'; // 'customer' or 'admin'
let sessionTimerInterval = null;
let sessionSecondsRemaining = 300; // 5 minutes

// Initialize Storage
function initDatabase() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      appData = JSON.parse(existing);
    } catch (e) {
      console.warn('Resetting corrupt bank DB to seed data');
      appData = JSON.parse(JSON.stringify(DEFAULT_BANK_DATA));
      saveDatabase();
    }
  } else {
    appData = JSON.parse(JSON.stringify(DEFAULT_BANK_DATA));
    saveDatabase();
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function resetBankDemoData() {
  if (confirm('Are you sure you want to restore the default simulated database? All new transactions and requests will reset.')) {
    localStorage.removeItem(STORAGE_KEY);
    initDatabase();
    showToast('Database reset to authentic initial demo state', 'info');
    if (currentUser && currentUser.role === 'admin') {
      refreshAdminView();
    } else if (currentUser) {
      refreshCustomerView();
    }
  }
}

// ================= ROUTING & VIEW CONTROLLER =================

function navigateHome() {
  if (currentUser) {
    if (currentUser.role === 'admin') {
      switchAdminTab('tab-admin-overview');
    } else {
      switchCustomerTab('tab-overview');
    }
  } else {
    showLoginView();
  }
}

function showLoginView() {
  document.getElementById('view-login').classList.remove('hidden');
  document.getElementById('view-app-portal').classList.add('hidden');
  document.getElementById('header-user-nav').classList.remove('flex');
  document.getElementById('header-user-nav').classList.add('hidden');
  document.getElementById('header-logged-out').classList.remove('hidden');
  document.getElementById('session-timer-wrap').classList.add('hidden');
  document.getElementById('session-timer-wrap').classList.remove('flex');
  clearInterval(sessionTimerInterval);
}

function showAppPortalView() {
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-app-portal').classList.remove('hidden');
  document.getElementById('header-user-nav').classList.remove('hidden');
  document.getElementById('header-user-nav').classList.add('flex');
  document.getElementById('header-logged-out').classList.add('hidden');
  document.getElementById('session-timer-wrap').classList.remove('hidden');
  document.getElementById('session-timer-wrap').classList.add('flex');

  // Update header and sidebar identity chips
  const initials = getInitials(currentUser.fullName);
  document.getElementById('user-avatar-initials').textContent = initials;
  document.getElementById('header-user-name').textContent = currentUser.fullName;
  document.getElementById('header-user-role').textContent = currentUser.role === 'admin' ? 'Bank Officer / Admin' : 'Primary Account Holder';

  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('sidebar-name').textContent = currentUser.fullName;
  document.getElementById('sidebar-acc-no').textContent = currentUser.role === 'admin' ? 'STAFF-AUTH-001' : `AC: •••• ${currentUser.checkingAcc.slice(-4)}`;

  startSessionCountdown();

  if (currentUser.role === 'admin') {
    document.getElementById('nav-customer-group').classList.add('hidden');
    document.getElementById('nav-admin-group').classList.remove('hidden');
    document.getElementById('btn-quick-transfer-aside').classList.add('hidden');
    switchAdminTab('tab-admin-overview');
    refreshAdminView();
  } else {
    document.getElementById('nav-customer-group').classList.remove('hidden');
    document.getElementById('nav-admin-group').classList.add('hidden');
    document.getElementById('btn-quick-transfer-aside').classList.remove('hidden');
    switchCustomerTab('tab-overview');
    refreshCustomerView();
  }
}

function switchLoginPortal(type) {
  activePortal = type;
  const custBtn = document.getElementById('tab-btn-customer');
  const adminBtn = document.getElementById('tab-btn-admin');
  const title = document.getElementById('login-title');
  const subtitle = document.getElementById('login-subtitle');
  const labelUser = document.getElementById('label-username-text');
  const registerPrompt = document.getElementById('register-account-prompt');
  const errorBox = document.getElementById('login-error-msg');
  errorBox.classList.add('hidden');

  if (type === 'admin') {
    custBtn.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2';
    adminBtn.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all bg-bank-900 text-white shadow-xs border border-bank-800 flex items-center justify-center gap-2';
    title.textContent = 'Bank Officer Portal';
    subtitle.textContent = 'Administrative authentication for liquidity management and service auditing.';
    labelUser.textContent = 'Administrator Employee ID / Username';
    document.getElementById('login-username').placeholder = 'e.g. admin';
    if (registerPrompt) registerPrompt.classList.add('hidden');
  } else {
    custBtn.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all bg-white text-bank-900 shadow-xs border border-slate-200/60 flex items-center justify-center gap-2';
    adminBtn.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2';
    title.textContent = 'Sign In to Online Banking';
    subtitle.textContent = 'Enter your banking account number or registered username.';
    labelUser.textContent = 'Username / Account Number';
    document.getElementById('login-username').placeholder = 'e.g. jane or 1002348911';
    if (registerPrompt) registerPrompt.classList.remove('hidden');
  }
  lucide.createIcons();
}

function quickFillLogin(type) {
  switchLoginPortal(type);
  if (type === 'admin') {
    document.getElementById('login-username').value = 'admin';
    document.getElementById('login-password').value = 'admin';
  } else {
    document.getElementById('login-username').value = 'jane';
    document.getElementById('login-password').value = '1234';
  }
}

// Pending OTP Verification State
let pendingAuthUser = null;
let currentOtpPhone = '';
let currentOtpDemoCode = null;
let otpCountdownInterval = null;
let otpSecondsRemaining = 60;

function handleFormLogin(e) {
  e.preventDefault();
  const usernameOrAcc = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const customPhone = document.getElementById('login-phone')?.value.trim();
  const errorBox = document.getElementById('login-error-msg');

  // Match against mock database
  const user = appData.users.find(u =>
    (u.username.toLowerCase() === usernameOrAcc.toLowerCase() || u.checkingAcc === usernameOrAcc) &&
    u.password === password
  );

  if (!user) {
    errorBox.textContent = 'Invalid credentials. Please verify your Account/Username and Password, or click quick demo fillers.';
    errorBox.classList.remove('hidden');
    return;
  }

  // Validate portal type compatibility
  if (activePortal === 'admin' && user.role !== 'admin') {
    errorBox.textContent = 'Access Denied: Customer accounts cannot authenticate through the Officer Administration portal.';
    errorBox.classList.remove('hidden');
    return;
  }

  errorBox.classList.add('hidden');
  pendingAuthUser = user;

  // Decide phone number: user-specified custom phone, or user profile phone
  let targetPhone = customPhone || user.phone || '+91 98200 98200';
  currentOtpPhone = targetPhone;

  // Initiate OTP dispatch
  dispatchOtpVerification(targetPhone);
}

async function dispatchOtpVerification(phone) {
  const submitBtn = document.getElementById('btn-login-submit');
  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2">◌</span>
    <span>Sending Verification Code...</span>
  `;

  try {
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();

    if (data.success) {
      currentOtpDemoCode = data.demoOtp || null;
      openOtpModal(phone, data);
    } else {
      showToast(data.error || 'Failed to dispatch OTP. Please check phone number.', 'error');
    }
  } catch (err) {
    console.warn('Backend OTP error, using client-side resilient flow:', err);
    // If running purely client-side without node server
    currentOtpDemoCode = Math.floor(100000 + Math.random() * 900000).toString();
    openOtpModal(phone, {
      mode: 'demo_fallback',
      demoOtp: currentOtpDemoCode,
      message: 'Simulated OTP delivered (Offline Mode)'
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
    lucide.createIcons();
  }
}

function openOtpModal(phone, apiData) {
  const modal = document.getElementById('modal-otp-verify');
  const phoneDisplay = document.getElementById('otp-phone-display');
  const banner = document.getElementById('otp-status-banner');
  const bannerText = document.getElementById('otp-status-text');
  const errorMsg = document.getElementById('otp-error-msg');

  phoneDisplay.textContent = phone;
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';

  // Setup status notification
  banner.classList.remove('hidden');
  if (apiData.mode === 'live') {
    banner.className = 'mb-4 p-3 rounded-xl text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-start gap-2.5';
    bannerText.innerHTML = `<strong>Live OTP Dispatched:</strong> Check your WhatsApp or SMS on <strong>${phone}</strong> for the 6-digit code.`;
  } else {
    banner.className = 'mb-4 p-3 rounded-xl text-xs font-medium border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-2.5';
    bannerText.innerHTML = `<strong>Demo Verification Code:</strong> <code>${apiData.demoOtp}</code> <span class="text-[11px] block text-amber-700 mt-0.5">(Live carrier delivery requires standard Indian mobile digits e.g. +91 98200 98200 or active MiniMoth region). Use <strong>${apiData.demoOtp}</strong> or <strong>123456</strong> to proceed.</span>`;
  }

  // Reset inputs
  const inputs = document.querySelectorAll('#otp-inputs-container .otp-digit');
  inputs.forEach((input, idx) => {
    input.value = '';
    input.disabled = false;
  });

  setupOtpInputHandlers();

  // Show modal
  modal.classList.remove('hidden');
  lucide.createIcons();
  startOtpCountdown();

  // Focus first input
  setTimeout(() => {
    if (inputs[0]) inputs[0].focus();
  }, 100);
}

function closeOtpModal() {
  document.getElementById('modal-otp-verify').classList.add('hidden');
  clearInterval(otpCountdownInterval);
  pendingAuthUser = null;
}

function setupOtpInputHandlers() {
  const inputs = Array.from(document.querySelectorAll('#otp-inputs-container .otp-digit'));

  inputs.forEach((input, index) => {
    // Only numeric input
    input.oninput = (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val[val.length - 1] : '';
      if (val && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    };

    // Backspace handling
    input.onkeydown = (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    };

    // Paste handling
    input.onpaste = (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = pasteData.replace(/[^0-9]/g, '').slice(0, 6);
      digits.split('').forEach((digit, i) => {
        if (inputs[i]) inputs[i].value = digit;
      });
      if (digits.length === 6) {
        inputs[5].focus();
      } else if (inputs[digits.length]) {
        inputs[digits.length].focus();
      }
    };
  });
}

function startOtpCountdown() {
  clearInterval(otpCountdownInterval);
  otpSecondsRemaining = 60;
  const timerDisplay = document.getElementById('otp-timer-display');
  const resendBtn = document.getElementById('btn-otp-resend');
  resendBtn.disabled = true;

  timerDisplay.textContent = `01:00`;

  otpCountdownInterval = setInterval(() => {
    otpSecondsRemaining--;
    const mins = String(Math.floor(otpSecondsRemaining / 60)).padStart(2, '0');
    const secs = String(otpSecondsRemaining % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;

    if (otpSecondsRemaining <= 0) {
      clearInterval(otpCountdownInterval);
      timerDisplay.textContent = `00:00`;
      resendBtn.disabled = false;
    }
  }, 1000);
}

async function resendOtpCode() {
  if (!currentOtpPhone) return;
  showToast('Resending OTP code...', 'info');
  await dispatchOtpVerification(currentOtpPhone);
}

async function handleOtpVerifySubmit(e) {
  e.preventDefault();
  const inputs = Array.from(document.querySelectorAll('#otp-inputs-container .otp-digit'));
  const code = inputs.map(i => i.value).join('');
  const errorMsg = document.getElementById('otp-error-msg');
  const verifyBtn = document.getElementById('btn-otp-verify-submit');

  if (code.length < 6) {
    errorMsg.textContent = 'Please enter all 6 digits of the verification code.';
    errorMsg.classList.remove('hidden');
    return;
  }

  errorMsg.classList.add('hidden');
  const originalBtnText = verifyBtn.innerHTML;
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2">◌</span>
    <span>Verifying Secure OTP...</span>
  `;

  try {
    let verified = false;

    // Check with backend
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentOtpPhone,
          code: code,
          demoOtp: currentOtpDemoCode
        })
      });
      const data = await res.json();
      if (data.success && data.verified) {
        verified = true;
      } else {
        errorMsg.textContent = data.error || 'Invalid OTP code. Please try again or click Resend.';
        errorMsg.classList.remove('hidden');
      }
    } catch (apiErr) {
      // Local fallback verify
      if (code === currentOtpDemoCode || code === '123456') {
        verified = true;
      } else {
        errorMsg.textContent = 'Invalid verification code. Enter the code shown or 123456.';
        errorMsg.classList.remove('hidden');
      }
    }

    if (verified) {
      // Complete login
      clearInterval(otpCountdownInterval);
      document.getElementById('modal-otp-verify').classList.add('hidden');

      currentUser = pendingAuthUser;
      pendingAuthUser = null;

      showToast(`Phone number verified! Welcome back, ${currentUser.fullName}.`, 'success');
      showAppPortalView();
      document.getElementById('form-login').reset();
    }
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = originalBtnText;
    lucide.createIcons();
  }
}


function handleLogout() {
  if (confirm('Are you sure you want to terminate this secure session?')) {
    currentUser = null;
    clearInterval(sessionTimerInterval);
    document.getElementById('form-login').reset();
    showToast('Secure session successfully closed.', 'info');
    showLoginView();
  }
}

// ================= CUSTOMER SUB-TABS =================

function switchCustomerTab(tabId) {
  // Hide all customer subpages
  document.querySelectorAll('.customer-subpage').forEach(el => el.classList.add('hidden'));
  // Hide all admin subpages
  document.querySelectorAll('.admin-subpage').forEach(el => el.classList.add('hidden'));

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  // Update navigation button active styles
  const navMap = {
    'tab-overview': 'nav-link-overview',
    'tab-transfer': 'nav-link-transfer',
    'tab-history': 'nav-link-history',
    'tab-services': 'nav-link-services'
  };

  Object.values(navMap).forEach(navId => {
    const btn = document.getElementById(navId);
    if (btn) {
      btn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-left transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }
  });

  const activeBtn = document.getElementById(navMap[tabId]);
  if (activeBtn) {
    activeBtn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-left transition-all bg-bank-800 text-white shadow-xs';
  }

  // Refresh tab-specific data
  if (tabId === 'tab-overview') refreshCustomerView();
  if (tabId === 'tab-transfer') updateTransferBalanceHint();
  if (tabId === 'tab-history') renderCustomerTransactions();
  if (tabId === 'tab-services') renderMyServiceRequests();

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= ADMIN SUB-TABS =================

function switchAdminTab(tabId) {
  // Hide all customer subpages
  document.querySelectorAll('.customer-subpage').forEach(el => el.classList.add('hidden'));
  // Hide all admin subpages
  document.querySelectorAll('.admin-subpage').forEach(el => el.classList.add('hidden'));

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  const navMap = {
    'tab-admin-overview': 'nav-link-admin-overview',
    'tab-admin-users': 'nav-link-admin-users',
    'tab-admin-approvals': 'nav-link-admin-approvals'
  };

  Object.values(navMap).forEach(navId => {
    const btn = document.getElementById(navId);
    if (btn) {
      btn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-left transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    }
  });

  const activeBtn = document.getElementById(navMap[tabId]);
  if (activeBtn) {
    activeBtn.className = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-left transition-all bg-bank-800 text-white shadow-xs';
  }

  if (tabId === 'tab-admin-overview') refreshAdminOverview();
  if (tabId === 'tab-admin-users') renderAdminUserDirectory();
  if (tabId === 'tab-admin-approvals') renderAdminApprovalQueue();

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= CUSTOMER DATA OPERATIONS =================

function refreshCustomerView() {
  if (!currentUser) return;

  // Sync user object with latest state in appData
  currentUser = appData.users.find(u => u.id === currentUser.id);

  // Update greetings and balances
  document.getElementById('overview-greeting-name').textContent = currentUser.fullName.split(' ')[0];
  document.getElementById('balance-checking').textContent = formatCurrency(currentUser.checkingBalance);
  document.getElementById('balance-savings').textContent = formatCurrency(currentUser.savingsBalance);
  document.getElementById('balance-total').textContent = formatCurrency(currentUser.checkingBalance + currentUser.savingsBalance);

  document.getElementById('overview-acc-checking-no').textContent = `AC: •••• ${currentUser.checkingAcc.slice(-4)}`;
  document.getElementById('overview-acc-savings-no').textContent = `AC: •••• ${currentUser.savingsAcc.slice(-4)}`;

  // Overview recent transactions snippet (last 5)
  const userTxns = appData.transactions
    .filter(t => t.userId === currentUser.id)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const tbody = document.getElementById('overview-recent-txns-body');
  if (tbody) {
    if (userTxns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">No transactions recorded yet.</td></tr>`;
    } else {
      tbody.innerHTML = userTxns.map(t => `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-4 font-mono text-[11px] text-slate-500">${t.date}</td>
          <td class="py-3 px-4 font-medium text-slate-800">${escapeHtml(t.description)}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${t.accountType === 'checking' ? 'bg-bank-100 text-bank-800' : 'bg-emerald-100 text-emerald-800'}">
              ${t.accountType.toUpperCase()}
            </span>
          </td>
          <td class="py-3 px-4 text-right font-mono font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}">
            ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
          </td>
          <td class="py-3 px-4 text-right font-mono text-slate-500">${formatCurrency(t.balanceAfter)}</td>
        </tr>
      `).join('');
    }
  }

  // Update pending request badge for current user
  const myPendingCount = appData.serviceRequests.filter(r => r.userId === currentUser.id && r.status === 'pending').length;
  const myBadge = document.getElementById('badge-my-pending-count');
  if (myBadge) {
    if (myPendingCount > 0) {
      myBadge.textContent = myPendingCount;
      myBadge.classList.remove('hidden');
    } else {
      myBadge.classList.add('hidden');
    }
  }

  lucide.createIcons();
}

function updateTransferBalanceHint() {
  if (!currentUser) return;
  const select = document.getElementById('transfer-from-account');
  const hint = document.getElementById('transfer-available-balance');
  if (select && hint) {
    const bal = select.value === 'checking' ? currentUser.checkingBalance : currentUser.savingsBalance;
    hint.textContent = formatCurrency(bal);
  }
}

function quickFillTransferFrom(accType) {
  switchCustomerTab('tab-transfer');
  const sel = document.getElementById('transfer-from-account');
  if (sel) {
    sel.value = accType;
    updateTransferBalanceHint();
  }
}

function setQuickTransferAmount(amt) {
  const input = document.getElementById('transfer-amount');
  if (input) {
    const current = parseFloat(input.value) || 0;
    input.value = (current + amt).toFixed(2);
  }
}

function resetTransferForm() {
  document.getElementById('form-transfer').reset();
  updateTransferBalanceHint();
}

function handleFundTransfer(e) {
  e.preventDefault();
  if (!currentUser) return;

  const fromAccType = document.getElementById('transfer-from-account').value;
  const recipientAcc = document.getElementById('transfer-recipient-acc').value.trim();
  const recipientName = document.getElementById('transfer-recipient-name').value.trim();
  const routingNo = document.getElementById('transfer-routing-no').value.trim();
  const purpose = document.getElementById('transfer-purpose').value;
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  const notes = document.getElementById('transfer-notes').value.trim();

  // Basic Validation
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid transfer amount greater than $0.', 'error');
    return;
  }

  const currentAvailable = fromAccType === 'checking' ? currentUser.checkingBalance : currentUser.savingsBalance;

  if (amount > currentAvailable) {
    showToast(`Insufficient Funds! You have ${formatCurrency(currentAvailable)} in ${fromAccType}, but tried to wire ${formatCurrency(amount)}.`, 'error');
    return;
  }

  if (routingNo.length !== 9) {
    showToast('Fedwire Routing number must be a 9-digit ABA code.', 'error');
    return;
  }

  // Deduct from sender
  if (fromAccType === 'checking') {
    currentUser.checkingBalance -= amount;
  } else {
    currentUser.savingsBalance -= amount;
  }

  const newBalance = fromAccType === 'checking' ? currentUser.checkingBalance : currentUser.savingsBalance;

  // Add debit transaction to sender
  const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  const memoDesc = notes ? `Wire to ${recipientName} (${notes})` : `Wire to ${recipientName} [${purpose}]`;

  appData.transactions.push({
    id: txnId,
    userId: currentUser.id,
    date: dateFormatted,
    timestamp: Date.now(),
    accountType: fromAccType,
    description: memoDesc,
    type: 'debit',
    amount: amount,
    balanceAfter: newBalance,
    status: 'Settled',
    recipientAcc: recipientAcc,
    routingNo: routingNo
  });

  // Check if beneficiary is another registered customer in our mock bank
  const beneficiaryUser = appData.users.find(u => u.checkingAcc === recipientAcc || u.savingsAcc === recipientAcc);
  if (beneficiaryUser) {
    const isToChecking = beneficiaryUser.checkingAcc === recipientAcc;
    if (isToChecking) {
      beneficiaryUser.checkingBalance += amount;
    } else {
      beneficiaryUser.savingsBalance += amount;
    }

    const benNewBal = isToChecking ? beneficiaryUser.checkingBalance : beneficiaryUser.savingsBalance;

    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: beneficiaryUser.id,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: isToChecking ? 'checking' : 'savings',
      description: `Internal Transfer Credit from ${currentUser.fullName}`,
      type: 'credit',
      amount: amount,
      balanceAfter: benNewBal,
      status: 'Settled'
    });
  }

  // Persist
  saveDatabase();

  showToast(`Successfully transferred ${formatCurrency(amount)} to ${recipientName}! Transaction ID: ${txnId}`, 'success');
  resetTransferForm();
  refreshCustomerView();
  switchCustomerTab('tab-overview');
}

// ================= SELF TRANSFER (CHECKING <-> SAVINGS) =================

function openSelfTransferModal() {
  document.getElementById('modal-self-transfer').classList.remove('hidden');
}

function closeSelfTransferModal() {
  document.getElementById('modal-self-transfer').classList.add('hidden');
}

function handleSelfTransferSubmit(e) {
  e.preventDefault();
  if (!currentUser) return;

  const direction = document.getElementById('self-transfer-direction').value;
  const amount = parseFloat(document.getElementById('self-transfer-amount').value);

  if (isNaN(amount) || amount <= 0) {
    showToast('Invalid transfer amount', 'error');
    return;
  }

  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  if (direction === 'checking-to-savings') {
    if (amount > currentUser.checkingBalance) {
      showToast('Insufficient funds in Checking account.', 'error');
      return;
    }
    currentUser.checkingBalance -= amount;
    currentUser.savingsBalance += amount;

    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'checking',
      description: 'Transfer Out to High-Yield Savings',
      type: 'debit',
      amount: amount,
      balanceAfter: currentUser.checkingBalance,
      status: 'Settled'
    });
    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'savings',
      description: 'Transfer In from Premier Checking',
      type: 'credit',
      amount: amount,
      balanceAfter: currentUser.savingsBalance,
      status: 'Settled'
    });
  } else {
    if (amount > currentUser.savingsBalance) {
      showToast('Insufficient funds in Savings account.', 'error');
      return;
    }
    currentUser.savingsBalance -= amount;
    currentUser.checkingBalance += amount;

    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'savings',
      description: 'Transfer Out to Premier Checking',
      type: 'debit',
      amount: amount,
      balanceAfter: currentUser.savingsBalance,
      status: 'Settled'
    });
    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'checking',
      description: 'Transfer In from High-Yield Savings',
      type: 'credit',
      amount: amount,
      balanceAfter: currentUser.checkingBalance,
      status: 'Settled'
    });
  }

  saveDatabase();
  closeSelfTransferModal();
  refreshCustomerView();
  showToast(`Successfully transferred ${formatCurrency(amount)} between your accounts.`, 'success');
}

// ================= CUSTOMER TRANSACTIONS TABLE & FILTERS =================

function renderCustomerTransactions() {
  if (!currentUser) return;

  const searchQuery = (document.getElementById('filter-txn-search').value || '').toLowerCase().trim();
  const accFilter = document.getElementById('filter-txn-account').value;
  const typeFilter = document.getElementById('filter-txn-type').value;
  const sortFilter = document.getElementById('filter-txn-sort').value;

  let list = appData.transactions.filter(t => t.userId === currentUser.id);

  if (accFilter !== 'all') {
    list = list.filter(t => t.accountType === accFilter);
  }

  if (typeFilter !== 'all') {
    list = list.filter(t => t.type === typeFilter);
  }

  if (searchQuery) {
    list = list.filter(t =>
      t.description.toLowerCase().includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery)
    );
  }

  // Sorting
  if (sortFilter === 'newest') {
    list.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortFilter === 'oldest') {
    list.sort((a, b) => a.timestamp - b.timestamp);
  } else if (sortFilter === 'highest') {
    list.sort((a, b) => b.amount - a.amount);
  }

  const tbody = document.getElementById('full-txn-history-body');
  const emptyState = document.getElementById('no-txns-state');

  if (list.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    tbody.innerHTML = list.map(t => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3.5 px-4 font-mono text-xs">
          <div class="font-bold text-slate-800">${t.id}</div>
          <div class="text-[11px] text-slate-400">${t.date}</div>
        </td>
        <td class="py-3.5 px-4">
          <span class="font-semibold text-slate-800">${escapeHtml(t.description)}</span>
          <div class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${t.status || 'Settled'}
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${t.accountType === 'checking' ? 'bg-bank-100 text-bank-800 border border-bank-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
            ${t.accountType.toUpperCase()}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right font-mono font-bold text-sm ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}">
          ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
        </td>
        <td class="py-3.5 px-4 text-right font-mono font-semibold text-slate-600">${formatCurrency(t.balanceAfter)}</td>
      </tr>
    `).join('');
  }

  lucide.createIcons();
}

// ================= CUSTOMER SERVICE APPLICATIONS =================

function handleCreditCardApply(e) {
  e.preventDefault();
  if (!currentUser) return;

  const cardType = document.getElementById('card-type-select').value;
  const income = parseFloat(document.getElementById('card-annual-income').value);
  const employment = document.getElementById('card-employment').value;

  if (isNaN(income) || income < 10000) {
    showToast('Please enter an eligible annual income figure.', 'error');
    return;
  }

  const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  const newReq = {
    id: reqId,
    userId: currentUser.id,
    userName: currentUser.fullName,
    serviceType: 'Credit Card',
    details: `${cardType} | Income: ${formatCurrency(income)} | ${employment}`,
    filedDate: dateFormatted,
    timestamp: Date.now(),
    status: 'pending'
  };

  appData.serviceRequests.unshift(newReq);
  saveDatabase();

  showToast(`Credit Card application #${reqId} submitted for underwriting approval!`, 'success');
  document.getElementById('form-card-request').reset();
  renderMyServiceRequests();
  refreshCustomerView();
}

function handleChequebookRequest(e) {
  e.preventDefault();
  if (!currentUser) return;

  const acc = document.getElementById('cheque-account').value;
  const leaves = document.getElementById('cheque-leaves').value;
  const address = document.getElementById('cheque-address').value.trim();

  const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  const newReq = {
    id: reqId,
    userId: currentUser.id,
    userName: currentUser.fullName,
    serviceType: 'Chequebook',
    details: `${leaves} (${acc.toUpperCase()}) | Deliver: ${address}`,
    filedDate: dateFormatted,
    timestamp: Date.now(),
    status: 'pending'
  };

  appData.serviceRequests.unshift(newReq);
  saveDatabase();

  showToast(`Chequebook request #${reqId} logged! Dispatched to Bank Operations.`, 'success');
  document.getElementById('form-cheque-request').reset();
  renderMyServiceRequests();
  refreshCustomerView();
}

function renderMyServiceRequests() {
  if (!currentUser) return;

  const myReqs = appData.serviceRequests
    .filter(r => r.userId === currentUser.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const tbody = document.getElementById('my-requests-body');
  if (!tbody) return;

  if (myReqs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">You have no active or historical service applications.</td></tr>`;
    return;
  }

  tbody.innerHTML = myReqs.map(r => {
    let statusBadge = '';
    if (r.status === 'pending') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Review</span>`;
    } else if (r.status === 'approved') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1"><i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Approved & Dispatched</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center justify-center gap-1"><i data-lucide="x" class="w-3 h-3 text-rose-600"></i> Declined</span>`;
    }

    let actionBtn = '';
    if (r.status === 'pending') {
      actionBtn = `<button onclick="cancelCustomerRequest('${r.id}')" class="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition" title="Withdraw filing">Cancel Request</button>`;
    } else {
      actionBtn = `<button onclick="deleteCustomerRequestRecord('${r.id}')" class="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition" title="Remove past archive record">Dismiss</button>`;
    }

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-mono font-bold text-slate-800">${r.id}</td>
        <td class="py-3 px-4">
          <span class="font-bold text-slate-800 flex items-center gap-1.5">
            <i data-lucide="${r.serviceType === 'Credit Card' ? 'credit-card' : 'book-open'}" class="w-3.5 h-3.5 text-bank-600"></i>
            ${r.serviceType}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(r.details)}</td>
        <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">${r.filedDate}</td>
        <td class="py-3 px-4 text-center">${statusBadge}</td>
        <td class="py-3 px-4 text-center">${actionBtn}</td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function cancelCustomerRequest(reqId) {
  if (confirm(`Withdraw and cancel service request #${reqId}?`)) {
    const idx = appData.serviceRequests.findIndex(r => r.id === reqId);
    if (idx !== -1) {
      appData.serviceRequests.splice(idx, 1);
      saveDatabase();
      showToast(`Service request #${reqId} has been cancelled and withdrawn.`, 'info');
      renderMyServiceRequests();
      refreshCustomerView();
    }
  }
}

function deleteCustomerRequestRecord(reqId) {
  const idx = appData.serviceRequests.findIndex(r => r.id === reqId);
  if (idx !== -1) {
    appData.serviceRequests.splice(idx, 1);
    saveDatabase();
    showToast(`Archived record #${reqId} dismissed.`, 'info');
    renderMyServiceRequests();
    refreshCustomerView();
  }
}

// ================= ADMIN DASHBOARD FEATURES =================

function refreshAdminView() {
  refreshAdminOverview();
  renderAdminUserDirectory();
  renderAdminApprovalQueue();
}

function refreshAdminOverview() {
  if (currentUser) {
    const adminHeading = document.getElementById('admin-officer-name');
    if (adminHeading) adminHeading.textContent = currentUser.fullName;
  }

  const customerUsers = appData.users.filter(u => u.role === 'customer');
  const totalLiquidity = customerUsers.reduce((sum, u) => sum + u.checkingBalance + u.savingsBalance, 0);
  const pendingApprovals = appData.serviceRequests.filter(r => r.status === 'pending').length;
  const totalTxns = appData.transactions.length;

  document.getElementById('admin-metric-users').textContent = customerUsers.length;
  document.getElementById('admin-metric-liquidity').textContent = formatCurrency(totalLiquidity);
  document.getElementById('admin-metric-pending').textContent = pendingApprovals;
  document.getElementById('admin-metric-txns').textContent = totalTxns;

  document.getElementById('badge-admin-pending').textContent = pendingApprovals;

  // Global transaction stream (last 8 systemwide)
  const globalTxns = [...appData.transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  const tbody = document.getElementById('admin-global-txns-body');
  if (tbody) {
    if (globalTxns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">No transactions across network.</td></tr>`;
    } else {
      tbody.innerHTML = globalTxns.map(t => {
        const user = appData.users.find(u => u.id === t.userId);
        const name = user ? user.fullName : 'Account Holder';
        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-4 font-mono text-[11px] text-slate-400">${t.date}</td>
            <td class="py-3 px-4 font-semibold text-slate-800">${escapeHtml(name)}</td>
            <td class="py-3 px-4 text-slate-600">${escapeHtml(t.description)}</td>
            <td class="py-3 px-4 text-right font-mono font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}">
              ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
            </td>
            <td class="py-3 px-4 text-center">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                AUDITED & POSTED
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  lucide.createIcons();
}

function renderAdminUserDirectory() {
  const customerUsers = appData.users.filter(u => u.role === 'customer');
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  tbody.innerHTML = customerUsers.map(u => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3.5 px-4">
        <div class="font-bold text-slate-900">${escapeHtml(u.fullName)}</div>
        <div class="text-[11px] text-slate-400 font-mono">ID: ${u.id} | @${u.username}</div>
      </td>
      <td class="py-3.5 px-4 font-mono text-slate-600 font-semibold">
        •••• •••• ${u.checkingAcc.slice(-4)}
      </td>
      <td class="py-3.5 px-4 font-mono text-slate-600 font-semibold">
        •••• •••• ${u.savingsAcc.slice(-4)}
      </td>
      <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
        ${formatCurrency(u.checkingBalance)}
      </td>
      <td class="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
        ${formatCurrency(u.savingsBalance)}
      </td>
      <td class="py-3.5 px-4 text-center">
        <button onclick="adminInspectUser('${u.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-bank-50 text-bank-700 text-xs font-semibold rounded-lg border border-slate-200 transition">
          Full Audit
        </button>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function renderAdminApprovalQueue() {
  const filter = document.getElementById('admin-filter-request-status').value;
  let list = [...appData.serviceRequests];

  if (filter !== 'all') {
    list = list.filter(r => r.status === filter);
  }

  list.sort((a, b) => b.timestamp - a.timestamp);

  const tbody = document.getElementById('admin-approvals-table-body');
  const emptyState = document.getElementById('admin-empty-approvals');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tbody.innerHTML = list.map(r => {
    let statusHtml = '';
    if (r.status === 'pending') {
      statusHtml = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>`;
    } else if (r.status === 'approved') {
      statusHtml = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>`;
    } else {
      statusHtml = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>`;
    }

    let actionsHtml = '';
    if (r.status === 'pending') {
      actionsHtml = `
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="handleAdminDecision('${r.id}', 'approved')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Approve
          </button>
          <button onclick="handleAdminDecision('${r.id}', 'rejected')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
            <i data-lucide="x" class="w-3.5 h-3.5"></i> Decline
          </button>
          <button onclick="handleAdminDeleteRequest('${r.id}')" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition" title="Delete filing permanently">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="flex items-center justify-center gap-2">
          <span class="text-xs font-mono text-slate-400">Decided</span>
          <button onclick="handleAdminDeleteRequest('${r.id}')" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition" title="Delete record permanently">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3.5 px-4 font-mono text-xs">
          <div class="font-bold text-slate-800">${r.id}</div>
          <div class="text-[11px] text-slate-400">${r.filedDate}</div>
        </td>
        <td class="py-3.5 px-4 font-semibold text-slate-900">${escapeHtml(r.userName)}</td>
        <td class="py-3.5 px-4 font-bold text-bank-700">
          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="${r.serviceType === 'Credit Card' ? 'credit-card' : 'book-open'}" class="w-4 h-4"></i>
            ${r.serviceType}
          </span>
        </td>
        <td class="py-3.5 px-4 text-xs text-slate-600 max-w-xs break-words">${escapeHtml(r.details)}</td>
        <td class="py-3.5 px-4 text-center">${statusHtml}</td>
        <td class="py-3.5 px-4 text-center">${actionsHtml}</td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function handleAdminDecision(reqId, decision) {
  const req = appData.serviceRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = decision;
  saveDatabase();

  const msg = decision === 'approved'
    ? `Request ${reqId} for ${req.userName} has been Approved and authorized.`
    : `Request ${reqId} for ${req.userName} was Declined.`;

  showToast(msg, decision === 'approved' ? 'success' : 'error');
  renderAdminApprovalQueue();
  refreshAdminOverview();
}

function handleAdminDeleteRequest(reqId) {
  if (confirm(`Are you sure you want to completely remove request #${reqId} from the database?`)) {
    const idx = appData.serviceRequests.findIndex(r => r.id === reqId);
    if (idx !== -1) {
      const removed = appData.serviceRequests.splice(idx, 1)[0];
      saveDatabase();
      showToast(`Request #${reqId} (${removed.serviceType}) deleted from the bank records.`, 'info');
      renderAdminApprovalQueue();
      refreshAdminOverview();
    }
  }
}

function adminInspectUser(userId) {
  const user = appData.users.find(u => u.id === userId);
  if (!user) return;

  alert(`CUSTOMER AUDIT CARD:\n\nName: ${user.fullName}\nUsername: ${user.username}\nChecking Account: ${user.checkingAcc} (Bal: ${formatCurrency(user.checkingBalance)})\nSavings Account: ${user.savingsAcc} (Bal: ${formatCurrency(user.savingsBalance)})\nEmail: ${user.email}\nPhone: ${user.phone}\nJoined: ${user.joinedDate}`);
}

// ================= ADMIN REGISTER NEW USER MODAL =================

function openCreateUserModal() {
  document.getElementById('modal-create-user').classList.remove('hidden');
}

function closeCreateUserModal() {
  document.getElementById('modal-create-user').classList.add('hidden');
}

// Self Registration by User (Open Bank Account Online)
function openSelfRegisterModal() {
  document.getElementById('modal-self-register').classList.remove('hidden');
}

function closeSelfRegisterModal() {
  document.getElementById('modal-self-register').classList.add('hidden');
}

function handleSelfRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const checking = parseFloat(document.getElementById('reg-checking').value) || 0;
  const savings = parseFloat(document.getElementById('reg-savings').value) || 0;

  if (appData.users.some(u => u.username.toLowerCase() === username)) {
    showToast('This username is already taken. Please choose another username.', 'error');
    return;
  }

  const newId = `usr_${String(appData.users.length + 1).padStart(3, '0')}`;
  const checkingAcc = `100${Math.floor(1000000 + Math.random() * 9000000)}`;
  const savingsAcc = `200${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newUser = {
    id: newId,
    username: username,
    password: password,
    fullName: fullName,
    role: 'customer',
    email: email,
    phone: phone,
    checkingAcc: checkingAcc,
    savingsAcc: savingsAcc,
    checkingBalance: checking,
    savingsBalance: savings,
    joinedDate: new Date().toISOString().slice(0, 10)
  };

  appData.users.push(newUser);

  // Add initial opening deposit transactions to ledger
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  if (checking > 0) {
    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: newId,
      date: dateFormatted,
      timestamp: Date.now() - 1000,
      accountType: 'checking',
      description: 'Account Opening Deposit - Checking',
      type: 'credit',
      amount: checking,
      balanceAfter: checking,
      status: 'Settled'
    });
  }

  if (savings > 0) {
    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: newId,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'savings',
      description: 'Account Opening Deposit - High-Yield Savings',
      type: 'credit',
      amount: savings,
      balanceAfter: savings,
      status: 'Settled'
    });
  }

  saveDatabase();
  closeSelfRegisterModal();

  // Automatically authenticate the newly registered user and load their dashboard
  currentUser = newUser;
  showToast(`Account successfully opened! Welcome to Apex Horizon, ${fullName}.`, 'success');
  showAppPortalView();
}

function handleAdminCreateUser(e) {
  e.preventDefault();
  const fullName = document.getElementById('new-user-fullname').value.trim();
  const username = document.getElementById('new-user-username').value.trim().toLowerCase();
  const password = document.getElementById('new-user-password').value.trim();
  const checking = parseFloat(document.getElementById('new-user-checking').value) || 0;
  const savings = parseFloat(document.getElementById('new-user-savings').value) || 0;

  if (appData.users.some(u => u.username.toLowerCase() === username)) {
    showToast('A user with this username already exists in the system.', 'error');
    return;
  }

  const newId = `usr_${String(appData.users.length + 1).padStart(3, '0')}`;
  const checkingAcc = `100${Math.floor(1000000 + Math.random() * 9000000)}`;
  const savingsAcc = `200${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newUser = {
    id: newId,
    username: username,
    password: password,
    fullName: fullName,
    role: 'customer',
    email: `${username}@horizonbank.com`,
    phone: '+1 (555) 900-0000',
    checkingAcc: checkingAcc,
    savingsAcc: savingsAcc,
    checkingBalance: checking,
    savingsBalance: savings,
    joinedDate: new Date().toISOString().slice(0, 10)
  };

  appData.users.push(newUser);

  // Add opening deposit transactions
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  if (checking > 0) {
    appData.transactions.push({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: newId,
      date: dateFormatted,
      timestamp: Date.now(),
      accountType: 'checking',
      description: 'Account Opening Cash Deposit',
      type: 'credit',
      amount: checking,
      balanceAfter: checking,
      status: 'Settled'
    });
  }

  saveDatabase();
  closeCreateUserModal();
  document.getElementById('new-user-fullname').value = '';
  document.getElementById('new-user-username').value = '';

  showToast(`Registered patron ${fullName} successfully!`, 'success');
  refreshAdminView();
}

// ================= SESSION TIMER & SECURITY NOTICES =================

function startSessionCountdown() {
  clearInterval(sessionTimerInterval);
  sessionSecondsRemaining = 300; // 5 min timeout
  updateSessionTimerDisplay();

  sessionTimerInterval = setInterval(() => {
    sessionSecondsRemaining--;
    updateSessionTimerDisplay();

    if (sessionSecondsRemaining === 60) {
      showToast('Security Alert: Session will expire in 60 seconds due to inactivity.', 'error');
    }

    if (sessionSecondsRemaining <= 0) {
      clearInterval(sessionTimerInterval);
      alert('Security Alert: Your online banking session has timed out due to compliance inactivity rules. Please sign in again.');
      currentUser = null;
      showLoginView();
    }
  }, 1000);
}

function updateSessionTimerDisplay() {
  const minutes = Math.floor(sessionSecondsRemaining / 60);
  const seconds = sessionSecondsRemaining % 60;
  const timerEl = document.getElementById('session-timer');
  if (timerEl) {
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// Notifications Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const notifBtn = document.getElementById('btn-notifications');
  const notifMenu = document.getElementById('notifications-menu');
  if (notifBtn && notifMenu) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      notifMenu.classList.add('hidden');
    });
  }
});

// ================= MODALS & UTILITIES =================

function openForgotPasswordModal() {
  document.getElementById('modal-forgot-pwd').classList.remove('hidden');
}

function closeForgotPasswordModal() {
  document.getElementById('modal-forgot-pwd').classList.add('hidden');
}

function showQuickTransferModal() {
  switchCustomerTab('tab-transfer');
}

function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function downloadStatements() {
  showToast('Generating official encrypted account statement CSV export...', 'info');
  setTimeout(() => {
    // Generate dummy CSV download
    const rows = [
      ['Date', 'Transaction ID', 'Description', 'Account', 'Type', 'Amount', 'Balance']
    ];
    const userTxns = appData.transactions.filter(t => t.userId === currentUser.id);
    userTxns.forEach(t => {
      rows.push([t.date, t.id, `"${t.description}"`, t.accountType, t.type, t.amount, t.balanceAfter]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_horizon_statement_${currentUser.username}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Encrypted statement downloaded successfully.', 'success');
  }, 600);
}

function showLegalNotice(type) {
  const notices = {
    privacy: 'Privacy Policy: Apex Horizon National Bank adheres strictly to Gramm-Leach-Bliley Act (GLBA) and does not share non-public customer biometric or financial information with unauthorized third parties.',
    terms: 'Electronic Banking Terms: All ACH and Wire instructions transmitted through this portal are final upon ledger settlement. Daily electronic transfer limits apply based on account tier.',
    fdic: 'FDIC Insurance: Deposit accounts are insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor, for each account ownership category.',
    security: 'Security Hub: Multi-factor token verification and automatic 5-minute inactivity termination safeguard your treasury against session interception.',
    phishing: 'Phishing Warning: Apex Horizon Bank will never ask for your password or PIN via SMS or unsolicited phone call.'
  };
  alert(notices[type] || 'Apex Horizon Trust Disclosures.');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-900/95 border-emerald-500 text-white',
    error: 'bg-rose-900/95 border-rose-500 text-white',
    info: 'bg-bank-900/95 border-bank-500 text-white'
  };

  const icons = {
    success: '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400 shrink-0"></i>',
    error: '<i data-lucide="alert-octagon" class="w-5 h-5 text-rose-400 shrink-0"></i>',
    info: '<i data-lucide="info" class="w-5 h-5 text-bank-300 shrink-0"></i>'
  };

  toast.className = `p-4 rounded-xl border shadow-xl flex items-start gap-3 text-xs backdrop-blur-md animate-scale-up pointer-events-auto transition-all ${colors[type] || colors.info}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="flex-1 font-medium leading-relaxed">${escapeHtml(message)}</div>
    <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white ml-1">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Formatting Helpers
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

function getInitials(name) {
  if (!name) return 'BK';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

// Global Startup & Cross-Window Sync
window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  showLoginView();
});

// Real-time synchronization across multiple browser tabs / sessions
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try {
      appData = JSON.parse(event.newValue);
      // Auto-refresh the current active view immediately
      if (currentUser) {
        // Re-bind current user in case balance or details updated
        const updatedUser = appData.users.find(u => u.id === currentUser.id);
        if (updatedUser) currentUser = updatedUser;

        if (currentUser.role === 'admin') {
          refreshAdminOverview();
          renderAdminApprovalQueue();
          renderAdminUserDirectory();
        } else {
          refreshCustomerView();
          renderMyServiceRequests();
          renderCustomerTransactions();
        }
      }
    } catch (err) {
      console.warn('Storage sync error:', err);
    }
  }
});
