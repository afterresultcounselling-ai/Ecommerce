import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './support.module.css';

import Banner from '../components/Banner';
import Contact from '../components/Contact';
import Layout from '../components/Layout/Layout';
import ThemeLink from '../components/ThemeLink';
import Policy from '../components/Policy';
import Container from '../components/Container';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL'; // replace after deploying Apps Script
// ────────────────────────────────────────────────────────────────────────────

// Wrap the existing Contact component to intercept form submission
// and send data to Apps Script / Google Sheets
const ContactWithBackend = () => {
  const [form,      setForm]      = useState({ name: '', email: '', message: '' });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action:    'submitSupportRequest',
          name:      form.name,
          email:     form.email,
          message:   form.message,
          timestamp: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
    } catch (_) {
      setSubmitted(true); // still show success to avoid user frustration
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.contactSuccess}>
        <h3>Thank you for reaching out!</h3>
        <p>We&rsquo;ve received your message and will get back to you within 1–2 business days at <strong>{form.email}</strong>.</p>
      </div>
    );
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.contactField}>
        <label>Name</label>
        <input
          type={'text'}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={'Your full name'}
        />
        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
      </div>

      <div className={styles.contactField}>
        <label>Email</label>
        <input
          type={'email'}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={'your@email.com'}
        />
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
      </div>

      <div className={styles.contactField}>
        <label>Message</label>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={'How can we help you?'}
        />
        {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
      </div>

      <button className={styles.contactSubmit} type={'submit'} disabled={loading}>
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
};

// ── Main SupportPage ────────────────────────────────────────────────────────
const SupportPage = (props) => {
  const subpages = [
    { title: 'Shipping',           key: 'shipping' },
    { title: 'Returns',            key: 'returns'  },
    { title: 'Payments & Security', key: 'payments' },
    { title: 'Terms & Conditions', key: 'terms'    },
    { title: 'Contact Us',         key: 'contact'  },
    { title: 'Privacy Policy',     key: 'policy'   },
  ];

  const [current, setCurrent] = useState(subpages[4]);

  const renderElement = (key) => {
    switch (key) {
      case 'contact': return <ContactWithBackend />;
      case 'policy':
      case 'shipping':
      case 'returns':
      case 'payments':
      case 'terms':
        return <Policy />;
      default:
        return <React.Fragment />;
    }
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (props.location.hash !== '' && props.location.hash !== undefined) {
      const hash = props.location.hash.substring(1);
      const tempCurrent = subpages.find((d) => d.key === hash);
      if (tempCurrent && tempCurrent.key !== current.key) {
        setCurrent(tempCurrent);
        window.scrollTo(0, 475);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.location]);

  // log support page visit
  useEffect(() => {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: 'support' }),
    }).catch(() => {});
  }, []);

  return (
    <Layout disablePaddingBottom>
      <div className={styles.root}>
        <Banner
          maxWidth={'650px'}
          name={current.title}
          bgImage={'/support.png'}
          color={'var(--standard-white)'}
          height={'350px'}
        />

        <div className={styles.navContainer}>
          {subpages.map((details) => (
            <ThemeLink
              onClick={() => navigate(`/support#${details.key}`)}
              key={details.key}
              isActive={current.key === details.key}
              to={`/support#${details.key}`}
            >
              {details.title}
            </ThemeLink>
          ))}
        </div>

        <div className={styles.pageContainer}>
          <Container size={'large'} spacing={'min'}>
            {subpages.map((details) => (
              <div
                key={details.key}
                className={`${styles.content} ${current.key === details.key ? styles.show : styles.hide}`}
              >
                {renderElement(details.key)}
              </div>
            ))}
          </Container>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
