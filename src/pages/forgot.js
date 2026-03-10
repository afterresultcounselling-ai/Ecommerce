import React, { useState } from 'react';
import { navigate } from 'gatsby';
import * as styles from './forgot.module.css';

import Layout from '../components/Layout/Layout';
import FormInputField from '../components/FormInputField/FormInputField';
import Button from '../components/Button';
import AttributeGrid from '../components/AttributeGrid';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE  = 'service_e4fso3l';
const EMAILJS_TEMPLATE = 'template_h3ygh8c';
const EMAILJS_PUBLIC   = 'nFt7Ce9WQYXL-GF4E';
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

// Since the site uses OTP login (no password), this page sends a fresh login link
const ForgotPage = () => {
  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const ejs = await loadEmailJS();
      if (ejs) await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { email, passcode: code, time: '5 minutes' });
    } catch (_) {}

    sessionStorage.setItem('loginOTP', JSON.stringify({ code, email, expiry: Date.now() + 5 * 60 * 1000 }));
    setLoading(false);
    setSubmitted(true);

    // Redirect to login page where OTP can be entered
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <Layout disablePaddingBottom>
      <div className={styles.root}>
        <h1 className={styles.title}>Access Your Account</h1>
        <p className={styles.message}>
          Enter your email address below. We&rsquo;ll send you a one-time login code so you can access your account instantly — no password needed.
        </p>

        {submitted ? (
          <div className={styles.successMessage}>
            <p>✓ Login code sent to <strong>{email}</strong>.</p>
            <p>Redirecting you to login…</p>
          </div>
        ) : (
          <form className={styles.formContainer} noValidate onSubmit={handleSubmit}>
            <FormInputField
              id={'email'}
              value={email}
              handleChange={(_, e) => { setEmail(e); setError(''); }}
              type={'email'}
              labelName={'Email'}
              error={error}
            />
            <div className={styles.buttonContainer}>
              <Button fullWidth level={'primary'} type={'submit'} disabled={loading}>
                {loading ? 'Sending…' : 'Send Login Code'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className={styles.gridContainer}>
        <AttributeGrid />
      </div>
    </Layout>
  );
};

export default ForgotPage;
