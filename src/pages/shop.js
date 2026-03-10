import React, { useState, useEffect } from 'react';
import * as styles from './shop.module.css';

import Banner from '../components/Banner';
import Breadcrumbs from '../components/Breadcrumbs';
import CardController from '../components/CardController';
import Container from '../components/Container';
import Chip from '../components/Chip';
import Icon from '../components/Icons/Icon';
import Layout from '../components/Layout';
import LayoutOption from '../components/LayoutOption';
import ProductCardGrid from '../components/ProductCardGrid';
import Button from '../components/Button';
import Config from '../config.json';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL'; // replace after deploying Apps Script
const PAGE_SIZE       = 6;
// ────────────────────────────────────────────────────────────────────────────

const ShopPage = () => {
  const [showFilter,    setShowFilter]    = useState(false);
  const [allProducts,   setAllProducts]   = useState([]);
  const [displayed,     setDisplayed]     = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);   // e.g. ['XS', 'S']
  const [sortBy,        setSortBy]        = useState('default'); // 'default' | 'asc' | 'desc'
  const [showSort,      setShowSort]      = useState(false);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);

  // ── fetch all products once ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${APPS_SCRIPT_URL}?action=getProducts&category=tshirts`)
      .then((r) => r.json())
      .then((data) => {
        const products = data.products || [];
        setAllProducts(products);
        setTotal(products.length);
        setDisplayed(products.slice(0, PAGE_SIZE));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // log visitor
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: 'shop' }),
    }).catch(() => {});

    window.addEventListener('keydown', escapeHandler);
    return () => window.removeEventListener('keydown', escapeHandler);
  }, []);

  // ── re-filter + re-sort whenever deps change ─────────────────────────
  useEffect(() => {
    let filtered = [...allProducts];

    if (activeFilters.length > 0) {
      filtered = filtered.filter((p) =>
        activeFilters.some((f) => p.sizes?.includes(f))
      );
    }

    if (sortBy === 'asc')  filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'desc') filtered.sort((a, b) => b.price - a.price);

    setTotal(filtered.length);
    setDisplayed(filtered.slice(0, page * PAGE_SIZE));
  }, [allProducts, activeFilters, sortBy, page]);

  const escapeHandler = (e) => { if (e?.keyCode === 27) setShowFilter(false); };

  const toggleFilter = (name) => {
    setActiveFilters((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
    setPage(1);
  };

  const loadMore = () => setPage((p) => p + 1);

  const sortOptions = [
    { label: 'Default',        value: 'default' },
    { label: 'Price: Low–High', value: 'asc'     },
    { label: 'Price: High–Low', value: 'desc'    },
  ];

  // Active size chips (from Config filters)
  const sizeFilter = Config.filters?.find((f) => f.category?.toLowerCase() === 'size');
  const sizeChips  = sizeFilter?.items?.map((i) => i.name) || ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'} spacing={'min'}>
          <div className={styles.breadcrumbContainer}>
            <Breadcrumbs crumbs={[{ link: '/', label: 'Home' }, { label: 'T-Shirts' }]} />
          </div>
        </Container>

        <Banner
          maxWidth={'650px'}
          name={`Plain T-Shirts`}
          subtitle={
            'Minimal, everyday plain tees crafted for comfort and versatility. Choose your colour and size — designed to be worn your way.'
          }
        />

        <Container size={'large'} spacing={'min'}>
          <div className={styles.metaContainer}>
            <span className={styles.itemCount}>{loading ? '…' : `${total} items`}</span>
            <div className={styles.controllerContainer}>
              <div
                className={styles.iconContainer}
                role={'presentation'}
                onClick={() => setShowFilter(!showFilter)}
              >
                <Icon symbol={'filter'} />
                <span>Filters</span>
              </div>

              {/* Sort dropdown */}
              <div className={`${styles.iconContainer} ${styles.sortContainer}`} role={'presentation'} onClick={() => setShowSort(!showSort)} style={{ position: 'relative' }}>
                <span>Sort by</span>
                <Icon symbol={'caret'} />
                {showSort && (
                  <div className={styles.sortDropdown}>
                    {sortOptions.map((o) => (
                      <div
                        key={o.value}
                        className={`${styles.sortOption} ${sortBy === o.value ? styles.sortActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); setSortBy(o.value); setShowSort(false); setPage(1); }}
                      >
                        {o.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardController
            closeFilter={() => setShowFilter(false)}
            visible={showFilter}
            filters={Config.filters}
          />

          {/* Size chips */}
          <div className={styles.chipsContainer}>
            {sizeChips.map((name) => (
              <div key={name} onClick={() => toggleFilter(name)} style={{ cursor: 'pointer' }}>
                <Chip name={name} isActive={activeFilters.includes(name)} />
              </div>
            ))}
          </div>

          <div className={styles.productContainer}>
            <span className={styles.mobileItemCount}>{loading ? '…' : `${total} items`}</span>
            {loading
              ? <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--grey-placeholder)' }}>Loading products…</p>
              : <ProductCardGrid data={displayed} />}
          </div>

          {!loading && displayed.length < total && (
            <div className={styles.loadMoreContainer}>
              <span>{displayed.length} of {total}</span>
              <Button fullWidth level={'secondary'} onClick={loadMore}>
                LOAD MORE
              </Button>
            </div>
          )}
        </Container>
      </div>

      <LayoutOption />
    </Layout>
  );
};

export default ShopPage;
