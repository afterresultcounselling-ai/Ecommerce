import React, { useState, useRef, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './signup.module.css';

import AttributeGrid from '../components/AttributeGrid/AttributeGrid';
import Layout from '../components/Layout/Layout';
import FormInputField from '../components/FormInputField/FormInputField';
import Button from '../components/Button';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE  = 'service_e4fso3l';
const EMAILJS_TEMPLATE = 'template_h3ygh8c';
const EMAILJS_PUBLIC   = 'nFt7Ce9WQYXL-GF4E';
const APPS_SCRIPT_URL  = 'YOUR_APPS_SCRIPT_URL'; // replace after deploying Apps Script
// ────────────────────────────────────────────────────────────────────────────

const loadEmailJS = () =>
  new Promise((resolve) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => {
      window.emailjs?.init(EMAILJS_PUBLIC);
      resolve(window.emailjs || null);
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });

const SignupPage = () => {
  // ── form state ─────────────────────────────────────────────────────────
  const [form, setForm]           = useState({ firstName: '', lastName: '', email: '' });
  const [errors, setErrors]       = useState({});
  const [otpStep, setOtpStep]     = useState(false);
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── helpers ────────────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    const code = generateOtp();
    try {
      const ejs = await loadEmailJS();
      if (ejs) {
        await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          email:    form.email,
          passcode: code,
          time:     '5 minutes',
        });
      }
      // log to Apps Script (fire-and-forget)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'logOtpSent', email: form.email }),
      }).catch(() => {});
    } catch (_) {
      // OTP still stored even if email fails
    } finally {
      sessionStorage.setItem(
        'signupOTP',
        JSON.stringify({ code, email: form.email, expiry: Date.now() + 5 * 60 * 1000 })
      );
      setOtpStep(true);
      startResendTimer();
      setLoading(false);
    }
  };

  const handleOtpInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const verifyOtp = () => {
    const entered = otp.join('');
    if (entered.length < 6) { setOtpError('Please enter the 6-digit code'); return; }
    const stored = JSON.parse(sessionStorage.getItem('signupOTP') || 'null');
    if (!stored || Date.now() > stored.expiry) { setOtpError('OTP expired. Please resend.'); return; }
    if (stored.email !== form.email)            { setOtpError('Email mismatch. Start over.'); return; }
    if (stored.code !== entered)                { setOtpError('Incorrect code. Try again.'); return; }

    // ── save user to Apps Script / Google Sheets ──
    const user = { firstName: form.firstName, lastName: form.lastName, email: form.email, createdAt: new Date().toISOString() };
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'createUser', ...user }),
    }).catch(() => {});

    // persist session locally
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.removeItem('signupOTP');
    navigate('/accountSuccess');
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <Layout disablePaddingBottom={true}>
      <div className={styles.root}>
        <div className={styles.signupFormContainer}>
          {!otpStep ? (
            <>
              <h1 className={styles.title}>Create Account</h1>
              <span className={styles.subtitle}>Enter your details to get started</span>

              <div className={styles.signupForm}>
                <div><FormInputField id={'firstName'} value={form.firstName} handleChange={(id, e) => setForm({ ...form, [id]: e })} type={'input'} labelName={'First Name'} error={errors.firstName} /></div>
                <div><FormInputField id={'lastName'}  value={form.lastName}  handleChange={(id, e) => setForm({ ...form, [id]: e })} type={'input'} labelName={'Last Name'}  error={errors.lastName}  /></div>
                <div><FormInputField id={'email'}     value={form.email}     handleChange={(id, e) => setForm({ ...form, [id]: e })} type={'email'} labelName={'Email'}      error={errors.email}     /></div>

                <Button fullWidth level={'primary'} onClick={sendOtp} disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Send Verification Code'}
                </Button>

                <span className={styles.reminder}>Already have an account?</span>
                <Button type={'button'} onClick={() => navigate('/login')} fullWidth level={'secondary'}>
                  Log In
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Verify Email</h1>
              <span className={styles.subtitle}>
                We sent a 6-digit code to <strong>{form.email}</strong>
              </span>

              <div className={styles.signupForm}>
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
                  Verify &amp; Create Account
                </Button>

                <span className={styles.reminder}>
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

export default SignupPage;
