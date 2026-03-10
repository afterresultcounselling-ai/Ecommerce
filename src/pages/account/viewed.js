import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './viewed.module.css';

import AccountLayout from '../../components/AccountLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import Layout from '../../components/Layout/Layout';
import ProductCardGrid from '../../components/ProductCardGrid';

// Recently viewed products are written to localStorage by the product detail page
// key: 'recentlyViewed' → array of product objects (max 12)

const RecentlyViewedPage = () => {
  const [viewed, setViewed] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/login'); return; }

    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setViewed(recent);
  }, []);

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/viewed', label: 'Recently Viewed' },
          ]}
        />
        <div className={styles.root}>
          <h1>Recently Viewed</h1>

          {viewed.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven&rsquo;t viewed any products yet.</p>
              <span className={styles.shopLink} onClick={() => navigate('/shop')}>
                Start Browsing →
              </span>
            </div>
          ) : (
            <div className={styles.gridContainer}>
              <ProductCardGrid
                spacing={true}
                height={480}
                columns={3}
                data={viewed}
              />
            </div>
          )}
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default RecentlyViewedPage;
