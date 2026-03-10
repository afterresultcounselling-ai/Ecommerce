import React, { useState, useRef, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './login.module.css';

import AttributeGrid from '../components/AttributeGrid/AttributeGrid';
import Layout from '../components/Layout/Layout';
import FormInputField from '../components/FormInputField/FormInputField';
import Button from '../components/Button';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE  = 'service_e4fso3l';
const EMAILJS_TEMPLATE = 'template_h3ygh8c';
const EMAILJS_PUBLIC   = 'nFt7Ce9WQYXL-GF4E';
const APPS_SCRIPT_URL  = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const loadEmailJS = () =>
  new Promise((resolve) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => { window.emailjs?.init(EMAILJS_PUBLIC); resolve(window.emailjs || null); };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });

const LoginPage = () => {
  const [email,       setEmail]       = useState('');
  const [emailError,  setEmailError]  = useState('');
  const [otpStep,     setOtpStep]     = useState(false);
  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const [otpError,    setOtpError]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [topError,    setTopError]    = useState('');
  const otpRefs  = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setLoading(true);

    // Check if user exists in Apps Script before sending OTP
    let userExists = false;
    try {
      const res  = await fetch(`${APPS_SCRIPT_URL}?action=checkUser&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      userExists = data.exists;
    } catch (_) {
      userExists = true; // allow login attempt even if check fails
    }

    if (!userExists) {
      setTopError('No account found with this email. Please sign up first.');
      setLoading(false);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const ejs = await loadEmailJS();
      if (ejs) await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { email, passcode: code, time: '5 minutes' });
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'logOtpSent', email }),
      }).catch(() => {});
    } catch (_) {}

    sessionStorage.setItem('loginOTP', JSON.stringify({ code, email, expiry: Date.now() + 5 * 60 * 1000 }));
    setOtpStep(true);
    startResendTimer();
    setLoading(false);
  };

  const handleOtpInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const verifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setOtpError('Please enter the 6-digit code.'); return; }
    const stored = JSON.parse(sessionStorage.getItem('loginOTP') || 'null');
    if (!stored || Date.now() > stored.expiry) { setOtpError('OTP expired. Please resend.'); return; }
    if (stored.email !== email)                { setOtpError('Email mismatch. Please start over.'); return; }
    if (stored.code !== entered)               { setOtpError('Incorrect code. Try again.'); return; }

    // Fetch user data from Apps Script
    try {
      const res  = await fetch(`${APPS_SCRIPT_URL}?action=getUser&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    } catch (_) {
      localStorage.setItem('user', JSON.stringify({ email }));
    }

    sessionStorage.removeItem('loginOTP');
    navigate('/account');
  };

  return (
    <Layout disablePaddingBottom={true}>
      {/* Top error banner */}
      <div className={`${styles.errorContainer} ${topError ? styles.show : ''}`}>
        <span className={styles.errorMessage}>{topError}</span>
      </div>

      <div className={styles.root}>
        <div className={styles.loginFormContainer}>
          {!otpStep ? (
            <>
              <h1 className={styles.loginTitle}>Login</h1>
              <span className={styles.subtitle}>Enter your email to receive a login code</span>

              <div className={styles.loginForm}>
                <div>
                  <FormInputField
                    id={'email'}
                    value={email}
                    handleChange={(_, e) => { setEmail(e); setTopError(''); }}
                    type={'email'}
                    labelName={'Email'}
                    error={emailError}
                  />
                </div>

                <Button fullWidth level={'primary'} onClick={sendOtp} disabled={loading}>
                  {loading ? 'Sending Code…' : 'Send Login Code'}
                </Button>

                <span className={styles.createLink}>New Customer?</span>
                <Button type={'button'} onClick={() => navigate('/signup')} fullWidth level={'secondary'}>
                  Create an Account
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.loginTitle}>Enter Code</h1>
              <span className={styles.subtitle}>
                We sent a 6-digit code to <strong>{email}</strong>
              </span>

              <div className={styles.loginForm}>
                <div className={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      className={styles.otpBox}
                      type={'text'}
                      inputMode={'numeric'}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKey(e, i)}
                    />
                  ))}
                </div>

                {otpError && <span className={styles.otpError}>{otpError}</span>}

                <Button fullWidth level={'primary'} onClick={verifyOtp}>
                  Verify &amp; Login
                </Button>

                <span className={styles.createLink}>
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : <span className={styles.resendLink} onClick={sendOtp}>Resend Code</span>}
                </span>

                <Button type={'button'} onClick={() => { setOtpStep(false); setOtp(['','','','','','']); setOtpError(''); }} fullWidth level={'secondary'}>
                  Go Back
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.attributeGridContainer}>
          <AttributeGrid />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
