import React, { useState, useEffect } from 'react';
import { parse } from 'query-string';

import Breadcrumbs from '../components/Breadcrumbs';
import Layout from '../components/Layout/Layout';
import Container from '../components/Container/Container';
import ProductCardGrid from '../components/ProductCardGrid';

import * as styles from './search.module.css';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL'; // replace after deploying Apps Script
// ────────────────────────────────────────────────────────────────────────────

const SearchPage = (props) => {
  const params      = parse(props.location.search);
  const searchQuery = params.q ? params.q.trim() : '';

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);

  useEffect(() => {
    if (!searchQuery) { setFetched(true); return; }

    setLoading(true);

    // Log visitor search to Google Sheets (fire-and-forget)
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logSearch', query: searchQuery }),
    }).catch(() => {});

    // Fetch matching products from Apps Script
    fetch(`${APPS_SCRIPT_URL}?action=searchProducts&q=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        // Apps Script returns { products: [...] }
        // Each product: { id, name, price, image, link, category }
        setResults(data.products || []);
      })
      .catch(() => setResults([]))
      .finally(() => { setLoading(false); setFetched(true); });
  }, [searchQuery]);

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'} spacing={'min'}>
          <Breadcrumbs
            crumbs={[
              { link: '/', label: 'Home' },
              { label: `Search results for '${searchQuery}'` },
            ]}
          />

          <div className={styles.searchLabels}>
            <h4>Search results for &lsquo;{searchQuery}&rsquo;</h4>
            {fetched && (
              <span>
                {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {loading && (
            <div className={styles.loadingState}>
              <p>Searching for &ldquo;{searchQuery}&rdquo;…</p>
            </div>
          )}

          {!loading && fetched && results.length === 0 && searchQuery && (
            <div className={styles.emptyState}>
              <p>No products found for &ldquo;{searchQuery}&rdquo;.</p>
              <p>Try a different keyword or browse our <a href={'/shop'}>full collection</a>.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ProductCardGrid
              showSlider={false}
              height={580}
              columns={3}
              data={results}
            />
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default SearchPage;
