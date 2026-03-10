import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './address.module.css';

import AccountLayout from '../../components/AccountLayout';
import AddressCard from '../../components/AddressCard';
import AddressForm from '../../components/AddressForm';
import Breadcrumbs from '../../components/Breadcrumbs';
import Icon from '../../components/Icons/Icon';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const AddressPage = () => {
  const [addressList,    setAddressList]    = useState([]);
  const [showForm,       setShowForm]       = useState(false);
  const [showDelete,     setShowDelete]     = useState(false);
  const [deleteIndex,    setDeleteIndex]    = useState(null);
  const [user,           setUser]           = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/login'); return; }
    setUser(stored);

    // Load addresses: try Apps Script first, fall back to localStorage
    fetch(`${APPS_SCRIPT_URL}?action=getAddresses&email=${encodeURIComponent(stored.email)}`)
      .then((r) => r.json())
      .then((data) => {
        const addrs = data.addresses || [];
        setAddressList(addrs);
        localStorage.setItem('addresses', JSON.stringify(addrs));
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem('addresses') || '[]');
        setAddressList(local);
      });
  }, []);

  const saveAddresses = (list) => {
    setAddressList(list);
    localStorage.setItem('addresses', JSON.stringify(list));
    // sync to Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveAddresses', email: user?.email, addresses: list }),
    }).catch(() => {});
  };

  const handleAddAddress = (newAddress) => {
    const updated = [...addressList, newAddress];
    saveAddresses(updated);
    setShowForm(false);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowDelete(true);
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    const updated = addressList.filter((_, i) => i !== deleteIndex);
    saveAddresses(updated);
    setDeleteIndex(null);
    setShowDelete(false);
  };

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/address', label: 'Addresses' },
          ]}
        />
        <h1>Addresses</h1>

        {!showForm && (
          <div className={styles.addressListContainer}>
            {addressList.map((address, index) => (
              <AddressCard
                key={index}
                showForm={() => setShowForm(true)}
                showDeleteForm={() => confirmDelete(index)}
                {...address}
              />
            ))}
            <div
              className={styles.addCard}
              role={'presentation'}
              onClick={() => setShowForm(true)}
            >
              <Icon symbol={'plus'} />
              <span>new address</span>
            </div>
          </div>
        )}

        {showForm && (
          <AddressForm
            closeForm={() => setShowForm(false)}
            onSave={handleAddAddress}
          />
        )}
      </AccountLayout>

      <Modal visible={showDelete} close={() => setShowDelete(false)}>
        <div className={styles.confirmDeleteContainer}>
          <h4>Delete Address?</h4>
          <p>
            Are you sure you want to delete this address? This action cannot be undone once you press <strong>&lsquo;Delete&rsquo;</strong>.
          </p>
          <div className={styles.actionContainer}>
            <Button onClick={handleDelete} level={'primary'}>Delete</Button>
            <Button onClick={() => setShowDelete(false)} level={'secondary'}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AddressPage;
