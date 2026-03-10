import React, { useState, useEffect } from 'react';
import * as styles from './shopV2.module.css';

import Accordion from '../components/Accordion';
import Banner from '../components/Banner';
import Breadcrumbs from '../components/Breadcrumbs';
import Checkbox from '../components/Checkbox';
import Container from '../components/Container';
import Layout from '../components/Layout/Layout';
import LayoutOption from '../components/LayoutOption';
import ProductCardGrid from '../components/ProductCardGrid';
import Button from '../components/Button';

import Config from '../config.json';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL'; // replace after deploying Apps Script
const PAGE_SIZE       = 9;
// ────────────────────────────────────────────────────────────────────────────

const ShopV2Page = () => {
  const filters = Config.filters;

  const [filterState,  setFilterState]  = useState(filters);
  const [allProducts,  setAllProducts]  = useState([]);
  const [displayed,    setDisplayed]    = useState([]);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);

  // ── fetch products ───────────────────────────────────────────────────
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

    // log visit
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: 'shopV2' }),
    }).catch(() => {});
  }, []);

  // ── recompute displayed whenever filter or page changes ──────────────
  useEffect(() => {
    const activeFilters = [];
    filterState.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.value) activeFilters.push({ category: cat.category, name: item.name });
      });
    });

    let filtered = [...allProducts];

    if (activeFilters.length > 0) {
      filtered = filtered.filter((p) =>
        activeFilters.some((f) => {
          const cat = f.category.toLowerCase();
          if (cat === 'size')  return p.sizes?.includes(f.name);
          if (cat === 'color') return p.color?.toLowerCase() === f.name.toLowerCase();
          return true;
        })
      );
    }

    setTotal(filtered.length);
    setDisplayed(filtered.slice(0, page * PAGE_SIZE));
  }, [filterState, allProducts, page]);

  const filterTick = (categoryIndex, labelIndex) => {
    const copy = filterState.map((cat, ci) => ({
      ...cat,
      items: cat.items.map((item, li) =>
        ci === categoryIndex && li === labelIndex
          ? { ...item, value: !item.value }
          : item
      ),
    }));
    setFilterState(copy);
    setPage(1);
  };

  const loadMore = () => setPage((p) => p + 1);

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'} spacing={'min'}>
          <Breadcrumbs crumbs={[{ link: '/', label: 'Home' }, { label: 'T-Shirts' }]} />
        </Container>

        <Banner
          maxWidth={'650px'}
          name={`Plain T-Shirts`}
          subtitle={
            'Minimal, everyday plain tees crafted for comfort and versatility. Choose your colour and size — designed to be worn your way.'
          }
        />

        <Container size={'large'} spacing={'min'}>
          <div className={styles.content}>
            {/* ── Sidebar filters ── */}
            <div className={styles.filterContainer}>
              {filterState.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <Accordion customStyle={styles} title={category.category}>
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.filters}>
                        <Checkbox
                          size={'sm'}
                          action={() => filterTick(categoryIndex, itemIndex)}
                          label={item.name}
                          value={item.value}
                          id={item.name}
                          name={item.name}
                        />
                      </div>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* ── Product grid ── */}
            <div>
              <div className={styles.metaContainer}>
                <span className={'standardSpan'}>{loading ? '…' : `${total} items`}</span>
              </div>

              {loading
                ? <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--grey-placeholder)' }}>Loading products…</p>
                : <ProductCardGrid height={'440px'} data={displayed} />}
            </div>
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

export default ShopV2Page;
