import React, { useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import * as styles from './accountSuccess.module.css';

import ActionCard from '../components/ActionCard';
import Container from '../components/Container';
import Layout from '../components/Layout/Layout';

const AccountSuccessPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/signup'); return; }
    setUser(stored);
  }, []);

  return (
    <Layout disablePaddingBottom>
      <Container size={'medium'}>
        <div className={styles.root}>
          <div className={styles.checkmark}>✓</div>
          <h1>Account Created{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
          <p>
            Welcome aboard. Your account is active and ready to use.
            Start shopping our plain t-shirt collection or manage your account settings below.
          </p>
          <div className={styles.actionContainer}>
            <ActionCard
              title={'My Account'}
              icon={'user'}
              subtitle={'View your account dashboard'}
              link={'/account'}
            />
            <ActionCard
              title={'Shop'}
              icon={'bag'}
              subtitle={'Browse our T-Shirts'}
              link={'/shop'}
            />
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default AccountSuccessPage;
