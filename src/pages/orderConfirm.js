import React, { useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import * as styles from './orderConfirm.module.css';

import ActionCard from '../components/ActionCard';
import Container from '../components/Container';
import Layout from '../components/Layout/Layout';

const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

const OrderConfirmPage = () => {
  const [order, setOrder] = useState(null);
  const [user,  setUser]  = useState(null);

  useEffect(() => {
    const storedUser  = JSON.parse(localStorage.getItem('user')         || 'null');
    const storedOrder = JSON.parse(localStorage.getItem('lastOrder')    || 'null');
    if (!storedUser) { navigate('/login'); return; }
    setUser(storedUser);
    setOrder(storedOrder);

    // Log visit to Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: 'orderConfirm', email: storedUser?.email }),
    }).catch(() => {});
  }, []);

  return (
    <Layout disablePaddingBottom>
      <Container size={'medium'}>
        <div className={styles.root}>
          <div className={styles.successIcon}>✓</div>
          <h1>Thank You{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
          <p className={styles.subtitle}>
            Your order has been placed successfully. A confirmation email has been sent to{' '}
            <strong>{user?.email}</strong>.
          </p>

          {order && (
            <div className={styles.orderDetails}>
              <div className={styles.orderRow}>
                <span>Order ID</span>
                <span className={styles.orderId}>{order.orderId || order.razorpayPaymentId || '—'}</span>
              </div>
              <div className={styles.orderRow}>
                <span>Amount Paid</span>
                <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.orderRow}>
                <span>Status</span>
                <span className={styles.statusBadge}>Placed</span>
              </div>
              {order.items && order.items.length > 0 && (
                <div className={styles.itemsList}>
                  <span className={styles.itemsLabel}>Items ordered:</span>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span>{item.name} — {item.color}, {item.size}</span>
                      <span>₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className={styles.helpText}>
            Questions? Email us at{' '}
            <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a>
          </p>

          <div className={styles.actionContainer}>
            <ActionCard
              title={'Order Status'}
              icon={'delivery'}
              subtitle={'Track your order'}
              link={'/account/orders'}
              size={'lg'}
            />
            <ActionCard
              title={'Shop'}
              icon={'bag'}
              subtitle={'Continue Shopping'}
              link={'/shop'}
            />
            <ActionCard
              title={'FAQs'}
              icon={'question'}
              subtitle={'Common questions'}
              link={'/faq'}
            />
            <ActionCard
              title={'Contact Us'}
              icon={'phone'}
              subtitle={'Reach out to us'}
              link={'/support#contact'}
            />
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default OrderConfirmPage;
