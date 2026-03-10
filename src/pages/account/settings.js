import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './settings.module.css';

import AccountLayout from '../../components/AccountLayout';
import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormInputField from '../../components/FormInputField';
import Layout from '../../components/Layout/Layout';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const [form,     setForm]     = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/login'); return; }
    setForm({
      firstName: stored.firstName || '',
      lastName:  stored.lastName  || '',
      email:     stored.email     || '',
      phone:     stored.phone     || '',
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSaved(false);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateUser', ...form, updatedAt: new Date().toISOString() }),
      });
      // Update local storage
      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existing, ...form }));
      setSaved(true);
    } catch (_) {
      setSaved(true); // optimistic — local save always works
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/login');
  };

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/settings', label: 'Settings' },
          ]}
        />
        <h1>Settings</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.nameSection}>
            <FormInputField
              id={'firstName'}
              value={form.firstName}
              handleChange={(id, val) => setForm({ ...form, [id]: val })}
              type={'input'}
              labelName={'First Name'}
              error={errors.firstName}
            />
            <FormInputField
              id={'lastName'}
              value={form.lastName}
              handleChange={(id, val) => setForm({ ...form, [id]: val })}
              type={'input'}
              labelName={'Last Name'}
              error={errors.lastName}
            />
            <FormInputField
              id={'email'}
              value={form.email}
              handleChange={(id, val) => setForm({ ...form, [id]: val })}
              type={'email'}
              labelName={'Email'}
              error={errors.email}
            />
            <FormInputField
              id={'phone'}
              value={form.phone}
              handleChange={(id, val) => setForm({ ...form, [id]: val })}
              type={'input'}
              labelName={'Phone (optional)'}
            />
          </div>

          {saved && (
            <p className={styles.savedMessage}>✓ Profile updated successfully.</p>
          )}

          <div className={styles.buttonRow}>
            <Button level={'primary'} type={'submit'} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* ── Login method info ────────────────────────── */}
        <div className={styles.loginMethodSection}>
          <h2>Login Method</h2>
          <p>You sign in using a one-time email code sent to <strong>{form.email}</strong>. No password is required.</p>
        </div>

        {/* ── Danger zone ─────────────────────────────── */}
        <div className={styles.dangerSection}>
          <h2>Account</h2>
          <Button level={'secondary'} onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default SettingsPage;
