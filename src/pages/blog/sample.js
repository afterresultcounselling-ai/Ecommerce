import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './sample.module.css';

import Blog from '../../components/Blog';
import Container from '../../components/Container';
import Layout from '../../components/Layout/Layout';
import { toOptimizedImage } from '../../helpers/general';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

// ── Static post content (fallback / used until CMS posts are added) ──────────
const STATIC_POSTS = {
  'how-to-style-a-plain-tshirt': {
    category: 'style',
    title:    'How to Style a Plain T-Shirt 5 Different Ways',
    image:    '/blogFeatured.png',
    date:     'March 2025',
    excerpt:  'A plain tee is the most versatile piece in your wardrobe. Here are five outfits you can build around a single colour.',
    body: [
      {
        type: 'paragraph',
        text: 'The plain t-shirt is arguably the most underrated garment in fashion. When styled correctly, a single well-fitted tee can carry you from a casual weekend brunch to a smart-casual dinner without breaking a sweat.',
      },
      { type: 'subheader', text: '1. Tuck it into high-waisted trousers' },
      {
        type: 'paragraph',
        text: 'A front-tuck into tailored high-waist trousers instantly elevates a basic tee. Pair with loafers or block heels and you have a clean, polished look. Stick to neutral tones — white, sand, or slate — for maximum versatility.',
      },
      { type: 'subheader', text: '2. Layer under an open overshirt' },
      {
        type: 'paragraph',
        text: 'Wearing a plain tee beneath an unbuttoned cotton overshirt adds dimension without effort. This works especially well in transitional weather when you need something light but layered.',
      },
      { type: 'subheader', text: '3. Pair with wide-leg denim' },
      {
        type: 'paragraph',
        text: 'Wide-leg jeans and a fitted plain tee is a balanced silhouette. The tee keeps the top streamlined while the jeans do the visual work. Tuck slightly at the front for a relaxed but intentional shape.',
      },
      { type: 'subheader', text: '4. Wear it under a structured blazer' },
      {
        type: 'paragraph',
        text: 'Replace the formal shirt with a plain cotton tee under a well-cut blazer. It reads as effortlessly smart and keeps things comfortable throughout the day.',
      },
      { type: 'subheader', text: '5. Keep it simple with shorts' },
      {
        type: 'paragraph',
        text: 'Sometimes the best styling decision is no styling decision at all. A plain tee with clean-cut shorts and white sneakers is timeless, easy, and always appropriate for warm weather.',
      },
    ],
    images: ['/cloth.png', '/collections/collection1.png'],
  },
  'washing-your-cotton-tshirt': {
    category: 'care',
    title:    'The Right Way to Wash Your Cotton T-Shirt',
    image:    '/cloth.png',
    date:     'February 2025',
    excerpt:  'Improper washing is the fastest way to ruin a good tee. Follow these simple steps to keep your cotton looking new for longer.',
    body: [
      {
        type: 'paragraph',
        text: 'A quality cotton t-shirt is an investment. Treat it well and it will last for years. Treat it poorly and you will find yourself shopping for a replacement far sooner than you should.',
      },
      { type: 'subheader', text: 'Wash cold, always' },
      {
        type: 'paragraph',
        text: 'Hot water is the primary cause of shrinkage and colour fade in cotton. Always wash your tees on a cold or cool cycle (30°C or below). It is just as effective at cleaning and far gentler on the fabric.',
      },
      { type: 'subheader', text: 'Turn it inside out' },
      {
        type: 'paragraph',
        text: 'Turning your t-shirt inside out before washing protects the outer surface from friction and reduces pilling. This is especially important for darker colours that are prone to fading.',
      },
      { type: 'subheader', text: 'Skip the dryer when possible' },
      {
        type: 'paragraph',
        text: 'Tumble drying is convenient but harsh. Air drying flat is the best option for maintaining the shape of your tee. If you must use a dryer, use a low heat setting and remove the tee while still slightly damp.',
      },
      { type: 'subheader', text: 'Iron on low heat' },
      {
        type: 'paragraph',
        text: 'If your tee needs ironing, use a low temperature setting and avoid ironing directly over any print or embroidery. A light steam iron on the reverse side works best.',
      },
    ],
    images: ['/cloth.png', '/blogFeatured.png'],
  },
  'why-we-chose-combed-cotton': {
    category: 'behind',
    title:    'Why We Use 100% Combed Cotton',
    image:    '/collections/collection1.png',
    date:     'January 2025',
    excerpt:  'Combed cotton removes short fibres and impurities, leaving only the longest, smoothest strands — the reason our tees feel different.',
    body: [
      {
        type: 'paragraph',
        text: 'When we set out to make the perfect plain t-shirt, the fabric decision was the most important one we made. After testing dozens of options, combed cotton was the clear choice — and here is why.',
      },
      { type: 'subheader', text: 'What is combed cotton?' },
      {
        type: 'paragraph',
        text: 'Standard cotton yarn is spun from fibres of varying lengths. Combed cotton goes through an additional step where short, weak fibres are removed using fine-tooth combs. What remains is a yarn made entirely of long, parallel fibres.',
      },
      { type: 'subheader', text: 'Why it matters' },
      {
        type: 'paragraph',
        text: 'The result is a fabric that is softer, stronger, and less prone to pilling than regular cotton. The longer fibres create a smoother surface that sits well against the skin and holds its shape wash after wash.',
      },
      { type: 'subheader', text: 'Our commitment' },
      {
        type: 'paragraph',
        text: 'Every t-shirt we make is cut from 100% combed ring-spun cotton. We do not compromise on this. We believe you should be able to feel the difference the moment you put it on.',
      },
    ],
    images: ['/collections/collection1.png', '/cloth.png'],
  },
};

// ── Default post shown for unknown slugs ─────────────────────────────────────
const DEFAULT_POST = STATIC_POSTS['how-to-style-a-plain-tshirt'];

const SamplePage = (props) => {
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get slug from URL path: /blog/my-slug → 'my-slug'
    const pathParts = (typeof window !== 'undefined' ? window.location.pathname : '').split('/');
    const slug      = pathParts[pathParts.length - 1] || 'sample';

    // Try Apps Script first, fall back to static
    fetch(`${APPS_SCRIPT_URL}?action=getBlogPost&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.post) {
          setPost(data.post);
        } else {
          setPost(STATIC_POSTS[slug] || DEFAULT_POST);
        }
      })
      .catch(() => {
        setPost(STATIC_POSTS[slug] || DEFAULT_POST);
      })
      .finally(() => setLoading(false));

    // log visit
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: `blog/${slug}` }),
    }).catch(() => {});
  }, []);

  if (loading) {
    return (
      <Layout>
        <Container>
          <div className={styles.blogContainer} style={{ textAlign: 'center', padding: '120px 0', color: 'var(--grey-placeholder)' }}>
            Loading post…
          </div>
        </Container>
      </Layout>
    );
  }

  const renderBody = (body = []) =>
    body.map((block, i) => {
      if (block.type === 'subheader') return <h2 key={i} className={styles.blogSubHeader}>{block.text}</h2>;
      if (block.type === 'paragraph') return <p key={i} className={styles.blogParagraph}>{block.text}</p>;
      return null;
    });

  return (
    <Layout>
      <div className={styles.root}>
        <Container>
          <div className={styles.blogContainer}>
            <Blog
              category={post.category}
              title={post.title}
              image={post.image}
              alt={post.title}
              date={post.date}
            >
              <div className={styles.content}>
                <p className={styles.excerpt}>{post.excerpt}</p>
                {renderBody(post.body || [])}
              </div>

              {post.images && post.images.length >= 2 && (
                <div className={styles.imagesContainer}>
                  <div className={styles.imageContainer}>
                    <img src={toOptimizedImage(post.images[0])} alt={post.title} />
                  </div>
                  <div className={styles.imageContainer}>
                    <img src={toOptimizedImage(post.images[1])} alt={`${post.title} detail`} />
                  </div>
                </div>
              )}

              {/* Back to blog link */}
              <div className={styles.content} style={{ marginTop: '48px' }}>
                <span
                  className={styles.backLink}
                  onClick={() => navigate('/blog')}
                >
                  ← Back to Journal
                </span>
              </div>
            </Blog>
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default SamplePage;
