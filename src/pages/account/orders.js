import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './orders.module.css';

import AccountLayout from '../../components/AccountLayout/AccountLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import Layout from '../../components/Layout/Layout';
import OrderItem from '../../components/OrderItem/OrderItem';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

// Status badge colours
const STATUS_COLORS = {
  placed:     { bg: '#FFF8E7', text: '#B59F66' },
  shipped:    { bg: '#E8F4FD', text: '#2563EB' },
  'on the way': { bg: '#EDF7ED', text: '#16A34A' },
  delivered:  { bg: '#EDF7ED', text: '#16A34A' },
  cancelled:  { bg: '#FEE2E2', text: '#DC2626' },
};

const StatusBadge = ({ status }) => {
  const key    = (status || '').toLowerCase();
  const colors = STATUS_COLORS[key] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{
      background:   colors.bg,
      color:        colors.text,
      fontSize:     '11px',
      fontWeight:   600,
      padding:      '4px 10px',
      borderRadius: '12px',
      textTransform: 'capitalize',
      letterSpacing: '0.3px',
      whiteSpace:   'nowrap',
    }}>
      {status || 'Placed'}
    </span>
  );
};

const OrderPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/login'); return; }
    setUser(stored);

    fetch(`${APPS_SCRIPT_URL}?action=getOrders&email=${encodeURIComponent(stored.email)}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/orders/', label: 'Orders' },
          ]}
        />
        <h1>Orders</h1>

        {/* Table header */}
        <div className={`${styles.tableHeaderContainer} ${styles.gridStyle}`}>
          <span className={styles.tableHeader}>Order Details</span>
          <span className={styles.tableHeader}>Date</span>
          <span className={styles.tableHeader}>Last Update</span>
          <span className={styles.tableHeader}>Status</span>
        </div>

        {loading && (
          <p className={styles.emptyMessage}>Loading your orders…</p>
        )}

        {!loading && orders.length === 0 && (
          <div className={styles.emptyState}>
            <p>You haven&rsquo;t placed any orders yet.</p>
            <span className={styles.shopLink} onClick={() => navigate('/shop')}>
              Browse T-Shirts →
            </span>
          </div>
        )}

        {!loading && orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            {/* Order row header */}
            <div className={`${styles.gridStyle} ${styles.orderRowHeader}`}>
              <div className={styles.orderItemsPreview}>
                {(order.items || []).slice(0, 2).map((item, i) => (
                  <div key={i} className={styles.orderItemRow}>
                    {item.image && (
                      <img src={item.image} alt={item.name} className={styles.itemThumb} />
                    )}
                    <div>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>
                        {item.color && `${item.color} · `}{item.size} · Qty {item.quantity || 1} · ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
                {(order.items || []).length > 2 && (
                  <span className={styles.moreItems}>+{order.items.length - 2} more item(s)</span>
                )}
                <span className={styles.orderId}>Order #{order.id || order.razorpayPaymentId?.slice(-8)}</span>
              </div>

              <span className={styles.dateCell}>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>

              <span className={styles.dateCell}>
                {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>

              <StatusBadge status={order.status} />
            </div>

            {/* Order total */}
            <div className={styles.orderFooter}>
              <span>Total: <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong></span>
              {order.status?.toLowerCase() === 'delivered' && (
                <span className={styles.reorderLink} onClick={() => navigate('/shop')}>
                  Reorder →
                </span>
              )}
            </div>
          </div>
        ))}
      </AccountLayout>
    </Layout>
  );
};

export default OrderPage;
