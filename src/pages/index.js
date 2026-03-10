import * as React from 'react';
import { useEffect, useState } from 'react';

import AttributeGrid from '../components/AttributeGrid';
import Container from '../components/Container';
import Hero from '../components/Hero';
import BlogPreviewGrid from '../components/BlogPreviewGrid';
import Highlight from '../components/Highlight';
import Layout from '../components/Layout/Layout';
import ProductCollectionGrid from '../components/ProductCollectionGrid';
import ProductCardGrid from '../components/ProductCardGrid';
import Quote from '../components/Quote';
import Title from '../components/Title';

import * as styles from './index.module.css';
import { Link, navigate } from 'gatsby';
import { toOptimizedImage } from '../helpers/general';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const IndexPage = () => {
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    // Log homepage visit
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action:    'logVisit',
        page:      'home',
        referrer:  typeof document !== 'undefined' ? document.referrer : '',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});

    // Fetch newest products for the "New Arrivals" strip
    fetch(`${APPS_SCRIPT_URL}?action=getProducts&category=tshirts&limit=3&sort=newest`)
      .then((r) => r.json())
      .then((data) => setNewArrivals(data.products || []))
      .catch(() => {});
  }, []);

  return (
    <Layout disablePaddingBottom>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Hero
        maxWidth={'500px'}
        image={'/banner1.png'}
        title={'Everyday Essentials'}
        subtitle={'Plain T-Shirts. Crafted for Comfort.'}
        ctaText={'Shop Now'}
        ctaAction={() => navigate('/shop')}
      />

      {/* ── Brand message ─────────────────────────────────────────────── */}
      <div className={styles.messageContainer}>
        <p>
          Minimal. Comfortable. <span className={styles.gold}>Made to last.</span>
        </p>
        <p>
          100% combed cotton · Free shipping above <span className={styles.gold}>₹999</span>
        </p>
      </div>

      {/* ── Collection ────────────────────────────────────────────────── */}
      <div className={styles.collectionContainer}>
        <Container size={'large'}>
          <Title name={'Our Collection'} />
          <ProductCollectionGrid />
        </Container>
      </div>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <div className={styles.newArrivalsContainer}>
        <Container>
          <Title name={'New Arrivals'} link={'/shop'} textLink={'view all'} />
          <ProductCardGrid
            spacing={true}
            showSlider
            height={480}
            columns={3}
            data={newArrivals}
          />
        </Container>
      </div>

      {/* ── Highlight ─────────────────────────────────────────────────── */}
      <div className={styles.highlightContainer}>
        <Container size={'large'} fullMobile>
          <Highlight
            image={'/highlight.png'}
            altImage={'highlight image'}
            miniImage={'/highlightmin.png'}
            miniImageAlt={'mini highlight image'}
            title={'Pure Cotton Comfort'}
            description={
              'Our plain t-shirts are knitted from 100% combed cotton — pre-shrunk, breathable, and built for everyday wear.'
            }
            textLink={'shop now'}
            link={'/shop'}
          />
        </Container>
      </div>

      {/* ── Promotion banner ─────────────────────────────────────────── */}
      <div className={styles.promotionContainer}>
        <Hero image={toOptimizedImage('/banner2.png')} title={`Free Shipping\nAbove ₹999`} />
        <div className={styles.linkContainers}>
          <Link to={'/shop'}>Shop Now</Link>
          <Link to={'/faq'}>FAQs</Link>
        </div>
      </div>

      {/* ── Quote ─────────────────────────────────────────────────────── */}
      <Quote
        bgColor={'var(--standard-light-grey)'}
        title={'our philosophy'}
        quote={
          '"Simplicity is the ultimate sophistication. We make plain t-shirts because we believe the best basics let you — not the label — speak."'
        }
      />

      {/* ── Social proof ──────────────────────────────────────────────── */}
      <div className={styles.socialContainer}>
        <Title
          name={'Worn by You'}
          subtitle={'Tag us to be featured.'}
        />
        <div className={styles.socialContentGrid}>
          <img src={toOptimizedImage('/social/socialMedia1.png')} alt={'customer photo 1'} />
          <img src={toOptimizedImage('/social/socialMedia2.png')} alt={'customer photo 2'} />
          <img src={toOptimizedImage('/social/socialMedia3.png')} alt={'customer photo 3'} />
          <img src={toOptimizedImage('/social/socialMedia4.png')} alt={'customer photo 4'} />
        </div>
      </div>

      {/* ── Sustainable section ───────────────────────────────────────── */}
      <div className={styles.sustainableContainer}>
        <Hero
          image={toOptimizedImage('/banner3.png')}
          title={'Simple. Sustainable.'}
          subtitle={
            'From ethical sourcing to minimal packaging — we care about how your t-shirt reaches you and what it leaves behind.'
          }
          ctaText={'Learn more'}
          maxWidth={'660px'}
          ctaStyle={styles.ctaCustomButton}
          ctaAction={() => navigate('/faq')}
        />
      </div>

      <AttributeGrid />
    </Layout>
  );
};

export default IndexPage;
