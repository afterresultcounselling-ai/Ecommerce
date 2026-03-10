import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './favorites.module.css';

import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import Container from '../../components/Container';
import FavoriteCard from '../../components/FavoriteCard/FavoriteCard';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const FavoritesPage = () => {
  const [favorites,   setFavorites]   = useState([]);
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [user,        setUser]        = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored) { navigate('/login'); return; }
    setUser(stored);

    // Load favorites from Apps Script, fall back to localStorage
    fetch(`${APPS_SCRIPT_URL}?action=getFavorites&email=${encodeURIComponent(stored.email)}`)
      .then((r) => r.json())
      .then((data) => {
        const favs = data.favorites || [];
        setFavorites(favs);
        localStorage.setItem('favorites', JSON.stringify(favs));
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(local);
      });
  }, []);

  const saveFavorites = (list) => {
    setFavorites(list);
    localStorage.setItem('favorites', JSON.stringify(list));
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'saveFavorites', email: user?.email, favorites: list }),
    }).catch(() => {});
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowDelete(true);
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    const updated = favorites.filter((_, i) => i !== deleteIndex);
    saveFavorites(updated);
    setDeleteIndex(null);
    setShowDelete(false);
  };

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'}>
          <Breadcrumbs
            crumbs={[
              { link: '/', label: 'Home' },
              { link: '/account/favorites', label: 'Favorites' },
            ]}
          />
          <h1>Favorites</h1>

          {favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven&rsquo;t saved any favourites yet.</p>
              <span className={styles.shopLink} onClick={() => navigate('/shop')}>
                Browse T-Shirts →
              </span>
            </div>
          ) : (
            <div className={styles.favoriteListContainer}>
              {favorites.map((fav, index) => (
                <FavoriteCard
                  key={index}
                  showConfirmDialog={() => confirmDelete(index)}
                  img={fav.img || fav.image}
                  alt={fav.alt || fav.name}
                  color={fav.color}
                  size={fav.size}
                  name={fav.name}
                  price={fav.price}
                />
              ))}
            </div>
          )}
        </Container>
      </div>

      <Modal visible={showDelete} close={() => setShowDelete(false)}>
        <div className={styles.confirmDeleteContainer}>
          <h4>Remove from Favorites?</h4>
          <p>
            Are you sure you want to remove this item? This cannot be undone once you press <strong>&lsquo;Delete&rsquo;</strong>.
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

export default FavoritesPage;
