(function () {
  let googleConfig = { configured: false, clientId: '' };
  let tokenClient = null;
  let gisReady = false;

  // ─── Demo Google Accounts for Simulated Picker ───────────────────────
  const demoAccounts = [
    { name: 'Rahim Uddin',     email: 'rahim.uddin@gmail.com',     avatar: null, initials: 'RU', color: '#4285F4' },
    { name: 'Fatima Akter',    email: 'fatima.akter@gmail.com',     avatar: null, initials: 'FA', color: '#EA4335' },
    { name: 'Kamal Hossain',   email: 'kamal.hossain@gmail.com',   avatar: null, initials: 'KH', color: '#34A853' },
    { name: 'Nusrat Jahan',    email: 'nusrat.jahan@gmail.com',     avatar: null, initials: 'NJ', color: '#FBBC05' },
    { name: 'Arif Rahman',     email: 'arif.rahman@gmail.com',      avatar: null, initials: 'AR', color: '#8E24AA' }
  ];

  // ─── Inject CSS for the Google Account Picker Modal ──────────────────
  function injectPickerStyles() {
    if (document.getElementById('goog-picker-styles')) return;
    const style = document.createElement('style');
    style.id = 'goog-picker-styles';
    style.textContent = `
      /* Overlay */
      .goog-picker-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.45);
        z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        animation: googPickerFadeIn 0.2s ease-out;
        backdrop-filter: blur(2px);
      }
      @keyframes googPickerFadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }

      /* Modal Card */
      .goog-picker-modal {
        background: #fff;
        border-radius: 28px;
        width: 400px;
        max-width: 92vw;
        box-shadow: 0 24px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05);
        overflow: hidden;
        animation: googPickerSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: 'Google Sans', 'Segoe UI', Roboto, Arial, sans-serif;
      }
      @keyframes googPickerSlideUp {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Header */
      .goog-picker-header {
        padding: 32px 32px 0;
        text-align: center;
      }
      .goog-picker-glogo {
        display: flex; align-items: center; justify-content: center; gap: 2px;
        margin-bottom: 20px;
      }
      .goog-picker-glogo svg { height: 24px; }
      .goog-picker-header h2 {
        font-size: 22px; font-weight: 400;
        color: #202124; margin: 0 0 6px; letter-spacing: -0.01em;
      }
      .goog-picker-header p {
        font-size: 14px; color: #5f6368;
        margin: 0 0 4px; font-weight: 400;
      }
      .goog-picker-header .goog-picker-subtitle {
        font-size: 13px; color: #5f6368; margin: 0;
      }

      /* Account List */
      .goog-picker-accounts {
        padding: 12px 16px 8px;
        max-height: 300px;
        overflow-y: auto;
      }
      .goog-picker-account {
        display: flex; align-items: center; gap: 14px;
        padding: 10px 16px;
        border-radius: 16px;
        cursor: pointer;
        transition: background 0.15s;
        text-decoration: none;
        border: none; background: none; width: 100%;
        text-align: left; font-family: inherit;
      }
      .goog-picker-account:hover {
        background: #f1f3f4;
      }
      .goog-picker-account:active {
        background: #e8eaed;
      }

      /* Avatar circle */
      .goog-picker-avatar {
        width: 40px; height: 40px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; font-weight: 500;
        color: #fff; flex-shrink: 0;
        letter-spacing: 0.02em;
      }

      /* Account Info */
      .goog-picker-info {
        flex: 1; min-width: 0;
      }
      .goog-picker-name {
        font-size: 14px; font-weight: 500;
        color: #202124;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .goog-picker-email {
        font-size: 12px; color: #5f6368;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-top: 1px;
      }

      /* Checkmark (appears on selected) */
      .goog-picker-account .goog-picker-check {
        display: none;
        color: #1a73e8;
        flex-shrink: 0;
      }
      .goog-picker-account.selected .goog-picker-check {
        display: block;
      }

      /* Use another account */
      .goog-picker-another {
        display: flex; align-items: center; gap: 14px;
        padding: 10px 16px;
        border-radius: 16px;
        cursor: pointer;
        transition: background 0.15s;
        border: none; background: none; width: calc(100% - 32px);
        margin: 0 16px;
        text-align: left; font-family: inherit;
      }
      .goog-picker-another:hover { background: #f1f3f4; }
      .goog-picker-another-icon {
        width: 40px; height: 40px;
        border-radius: 50%;
        border: 2px solid #dadce0;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .goog-picker-another-icon svg {
        width: 20px; height: 20px; color: #5f6368;
      }
      .goog-picker-another-text {
        font-size: 14px; font-weight: 500; color: #202124;
      }

      /* Divider */
      .goog-picker-divider {
        border: none;
        border-top: 1px solid #e8eaed;
        margin: 8px 0;
      }

      /* Footer */
      .goog-picker-footer {
        padding: 16px 32px 24px;
        display: flex; justify-content: space-between; align-items: center;
        border-top: 1px solid #e8eaed;
        margin-top: 8px;
      }
      .goog-picker-footer-links {
        display: flex; gap: 24px;
      }
      .goog-picker-footer a {
        font-size: 12px; color: #5f6368;
        text-decoration: none; font-weight: 500;
      }
      .goog-picker-footer a:hover { color: #202124; }

      /* Loading spinner on account click */
      .goog-picker-account.loading .goog-picker-check {
        display: block !important;
      }
      .goog-picker-account.loading .goog-picker-check svg {
        animation: googPickerSpin 0.8s linear infinite;
      }
      @keyframes googPickerSpin {
        from { transform: rotate(0deg); } to { transform: rotate(360deg); }
      }

      /* Custom email input row */
      .goog-picker-custom-row {
        padding: 12px 16px 0;
        display: none;
      }
      .goog-picker-custom-row.visible { display: block; }
      .goog-picker-custom-input {
        width: 100%; box-sizing: border-box;
        padding: 12px 16px;
        border: 2px solid #dadce0;
        border-radius: 12px;
        font-size: 14px; font-family: inherit;
        outline: none; transition: border-color 0.2s;
        color: #202124;
      }
      .goog-picker-custom-input:focus {
        border-color: #1a73e8;
      }
      .goog-picker-custom-input::placeholder { color: #9aa0a6; }
      .goog-picker-custom-submit {
        margin-top: 10px;
        width: 100%;
        padding: 10px;
        background: #1a73e8;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 14px; font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s;
      }
      .goog-picker-custom-submit:hover { background: #1557b0; }
      .goog-picker-custom-submit:disabled {
        background: #94bef7; cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Google Logo SVG ─────────────────────────────────────────────────
  const googleLogoSVG = `<svg viewBox="0 0 74 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z" fill="#4285F4"/><path d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z" fill="#EA4335"/><path d="M53.58 7.49h-.09c-.57-.68-1.67-1.3-3.06-1.3C47.53 6.19 45 8.72 45 12c0 3.26 2.53 5.81 5.43 5.81 1.39 0 2.49-.62 3.06-1.32h.09v.81c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.33 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V6.49h-2.42v1zm-2.93 8.03c-1.76 0-3.1-1.5-3.1-3.52 0-2.05 1.34-3.52 3.1-3.52 1.74 0 3.1 1.5 3.1 3.54 0 2.01-1.36 3.5-3.1 3.5z" fill="#4285F4"/><path d="M38 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z" fill="#FBBC05"/><path d="M58 .24h2.51v17.57H58z" fill="#34A853"/><path d="M68.26 6.19c-2.89 0-5.33 2.2-5.33 5.81 0 3.46 2.43 5.81 5.61 5.81 1.71 0 2.69-.56 3.61-1.52l-1.58-1.58c-.51.51-1.21.94-2.03.94-1.63 0-2.47-1-2.83-1.87l7.79-3.22-.26-.63c-.5-1.26-2.02-3.74-4.98-3.74zm-.07 2.24c.76 0 1.41.38 1.64.93l-5.2 2.16c-.08-2.05 1.64-3.09 3.56-3.09z" fill="#EA4335"/></svg>`;

  // ─── Show Simulated Google Account Picker ────────────────────────────
  function showDemoGooglePicker() {
    injectPickerStyles();

    // Remove any existing picker
    const existing = document.getElementById('googPickerOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'goog-picker-overlay';
    overlay.id = 'googPickerOverlay';

    // Close on overlay click (outside modal)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    const modal = document.createElement('div');
    modal.className = 'goog-picker-modal';

    // Build account rows
    const accountRows = demoAccounts.map((acc, i) => `
      <button class="goog-picker-account" data-idx="${i}" type="button">
        <div class="goog-picker-avatar" style="background:${acc.color}">${acc.initials}</div>
        <div class="goog-picker-info">
          <div class="goog-picker-name">${acc.name}</div>
          <div class="goog-picker-email">${acc.email}</div>
        </div>
        <span class="goog-picker-check">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" stroke="#dadce0" stroke-width="1.5" fill="none"/>
          </svg>
        </span>
      </button>
    `).join('');

    modal.innerHTML = `
      <div class="goog-picker-header">
        <div class="goog-picker-glogo">${googleLogoSVG}</div>
        <h2>Choose an account</h2>
        <p>to continue to <strong>CombinedTution</strong></p>
      </div>

      <div class="goog-picker-accounts">
        ${accountRows}
      </div>

      <hr class="goog-picker-divider">

      <button class="goog-picker-another" id="googPickerUseAnother" type="button">
        <div class="goog-picker-another-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
          </svg>
        </div>
        <span class="goog-picker-another-text">Use another account</span>
      </button>

      <div class="goog-picker-custom-row" id="googPickerCustomRow">
        <input type="email" class="goog-picker-custom-input" id="googPickerCustomEmail"
               placeholder="" autocomplete="email" />
        <button class="goog-picker-custom-submit" id="googPickerCustomSubmit" type="button">
          Continue
        </button>
      </div>

      <div class="goog-picker-footer">
        <div class="goog-picker-footer-links">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // ── Bind account clicks ──
    modal.querySelectorAll('.goog-picker-account').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.idx, 10);
        const acc = demoAccounts[idx];
        // Show loading state
        this.classList.add('loading', 'selected');
        this.querySelector('.goog-picker-check').innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>`;
        // Disable all buttons
        modal.querySelectorAll('.goog-picker-account, .goog-picker-another, .goog-picker-custom-submit').forEach(b => b.disabled = true);
        // Authenticate with backend
        handleDemoAccountSelection(acc, overlay);
      });
    });

    // ── "Use another account" toggle ──
    const useAnotherBtn = modal.querySelector('#googPickerUseAnother');
    const customRow = modal.querySelector('#googPickerCustomRow');
    const customInput = modal.querySelector('#googPickerCustomEmail');
    const customSubmit = modal.querySelector('#googPickerCustomSubmit');

    useAnotherBtn.addEventListener('click', () => {
      customRow.classList.toggle('visible');
      if (customRow.classList.contains('visible')) {
        customInput.focus();
      }
    });

    customSubmit.addEventListener('click', () => {
      const email = customInput.value.trim();
      if (!email || !email.includes('@')) {
        customInput.style.borderColor = '#d93025';
        customInput.focus();
        return;
      }
      customInput.style.borderColor = '#1a73e8';
      customSubmit.disabled = true;
      customSubmit.textContent = 'Signing in...';
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      handleDemoAccountSelection({ name, email }, overlay);
    });

    // Enter key in custom input
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); customSubmit.click(); }
    });
  }

  let currentAuthRole = 'guardian';

  // ─── Handle Demo Account Selection (calls backend) ──────────────────
  async function handleDemoAccountSelection(account, overlay) {
    try {
      const selectedRoleEl = document.getElementById('selectedRole');
      const roleToSend = (selectedRoleEl && selectedRoleEl.value) || currentAuthRole || 'guardian';

      const res = await fetch('/api/auth/google/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          role: roleToSend
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Demo Google login failed.');
        overlay.remove();
        return;
      }

      // Save token and user data
      if (data.token) localStorage.setItem('auth_token', data.token);
      if (data.user) {
        localStorage.setItem('tutoriaa_user', JSON.stringify(data.user));
        localStorage.setItem('combine_currentUser', JSON.stringify(data.user));
      }

      // Close modal immediately if open
      if (typeof window.closeLoginModal === 'function') {
        window.closeLoginModal();
      }

      // Close the picker with a brief delay for visual feedback
      setTimeout(() => {
        overlay.remove();

        if (typeof window.showToast === 'function') {
          window.showToast('✓ Welcome, ' + data.user.name + '! Signed in with Google.');
        }

        if (typeof window.updateAuthNavbar === 'function') {
          window.updateAuthNavbar();
        }

        if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
          setTimeout(() => { window.location.href = 'index.html'; }, 400);
        } else {
          setTimeout(() => { window.location.reload(); }, 500);
        }
      }, 500);
    } catch (err) {
      console.error('Demo Google login error:', err);
      alert('Network error during Google Sign-In. Please try again.');
      overlay.remove();
    }
  }

  // ─── Google Identity Services (Real) ─────────────────────────────────
  function loadGoogleIdentityScript() {
    if (document.getElementById('google-gsi-script') ||
        document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-gsi-script';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  async function fetchGoogleConfig() {
    try {
      const res = await fetch('/api/auth/google/config');
      if (res.ok) {
        googleConfig = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch Google Auth config:', e);
    }
  }

  function isGisLibraryLoaded() {
    return !!(window.google && window.google.accounts && window.google.accounts.oauth2);
  }

  function initGoogleTokenClient() {
    if (!isGisLibraryLoaded()) return false;
    if (!googleConfig.configured || !googleConfig.clientId) return false;

    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleConfig.clientId,
        scope: 'email profile',
        callback: handleOfficialGoogleAccessToken
      });
      gisReady = true;
      console.log('Google Token Client initialized successfully.');
      return true;
    } catch (err) {
      console.warn('Google Token Client initialization error:', err);
      return false;
    }
  }

  // ─── Main Trigger: Real Google popup or Demo Picker ──────────────────
  function triggerGoogleSignIn(options = {}) {
    if (typeof options === 'string') {
      currentAuthRole = options;
    } else if (options && options.role) {
      currentAuthRole = options.role;
    }

    // If Google Client ID is configured, use the real Google popup
    if (googleConfig.configured && googleConfig.clientId) {
      if (!tokenClient && !gisReady) {
        initGoogleTokenClient();
      }
      if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }
      if (!isGisLibraryLoaded()) {
        alert('Google Sign-In is still loading. Please wait a moment and try again.');
        return;
      }
    }

    // Otherwise, show the standard Google account selector pop-up
    showDemoGooglePicker();
  }

  // Expose globally
  window.triggerGoogleSignIn = triggerGoogleSignIn;
  window.openGoogleAuthModal = function (opts) { triggerGoogleSignIn(opts); };

  // Handle real Google access token response
  async function handleOfficialGoogleAccessToken(response) {
    if (!response || !response.access_token) {
      if (response && response.error === 'popup_closed_by_user') return;
      alert('Failed to get Google credentials. Please try again.');
      return;
    }

    try {
      const selectedRoleEl = document.getElementById('selectedRole');
      const roleToSend = (selectedRoleEl && selectedRoleEl.value) || currentAuthRole || 'guardian';

      const res = await fetch('/api/auth/google/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.access_token, role: roleToSend })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Google token verification failed on server.');
        return;
      }

      if (data.token) localStorage.setItem('auth_token', data.token);
      if (data.user) {
        localStorage.setItem('tutoriaa_user', JSON.stringify(data.user));
        localStorage.setItem('combine_currentUser', JSON.stringify(data.user));
      }

      if (typeof window.closeLoginModal === 'function') {
        window.closeLoginModal();
      }

      if (typeof window.showToast === 'function') {
        window.showToast('✓ Welcome, ' + data.user.name + '! Verified with Google.');
      }
      if (typeof window.updateAuthNavbar === 'function') {
        window.updateAuthNavbar();
      }

      if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
        setTimeout(() => { window.location.href = 'index.html'; }, 400);
      } else {
        setTimeout(() => { window.location.reload(); }, 500);
      }
    } catch (err) {
      console.error('Error sending Google credential to backend:', err);
      alert('Network error while verifying Google Account with server.');
    }
  }

  // ─── Global Delegated Click & Button Binding ────────────────────────
  function bindCustomButtons() {
    // Delegated click listener on document handles all current and dynamic Google buttons
    if (!window.__googleClickDelegated) {
      window.__googleClickDelegated = true;
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('#googleLoginBtn, #googleRegBtn, #modalGoogleLoginBtn, .tutoriaa-google-btn, [data-action="google-signin"]');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          const selectedRoleEl = document.getElementById('selectedRole');
          const role = (selectedRoleEl && selectedRoleEl.value) || 'guardian';
          triggerGoogleSignIn({ role });
        }
      }, true);
    }
  }

  function waitForGisAndInit() {
    if (isGisLibraryLoaded()) {
      initGoogleTokenClient();
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (isGisLibraryLoaded()) {
        clearInterval(interval);
        initGoogleTokenClient();
      } else if (attempts > 50) {
        clearInterval(interval);
      }
    }, 100);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────
  async function init() {
    loadGoogleIdentityScript();
    await fetchGoogleConfig();
    bindCustomButtons();
    waitForGisAndInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
