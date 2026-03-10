import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';

import BlogPreviewGrid from '../../components/BlogPreviewGrid';
import Container from '../../components/Container';
import Hero from '../../components/Hero';
import Layout from '../../components/Layout/Layout';
import ThemeLink from '../../components/ThemeLink';
import Button from '../../components/Button';

import * as styles from './index.module.css';
import { toOptimizedImage } from '../../helpers/general';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
const PAGE_SIZE       = 6;
// ────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All Posts',   key: 'all'          },
  { label: 'Style Tips',  key: 'style'        },
  { label: 'Care Guide',  key: 'care'         },
  { label: 'Behind Seams', key: 'behind'      },
  { label: 'News',        key: 'news'         },
];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [allPosts,        setAllPosts]       = useState([]);
  const [displayed,       setDisplayed]      = useState([]);
  const [total,           setTotal]          = useState(0);
  const [page,            setPage]           = useState(1);
  const [loading,         setLoading]        = useState(true);
  const [featured,        setFeatured]       = useState(null);

  // ── fetch posts ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=getBlogPosts&category=${activeCategory}`)
      .then((r) => r.json())
      .then((data) => {
        const posts = data.posts || [];
        setAllPosts(posts);
        setTotal(posts.length);
        setFeatured(posts[0] || null);
        setDisplayed(posts.slice(0, PAGE_SIZE));
        setPage(1);
      })
      .catch(() => {
        // fallback static posts so the page isn't blank
        const fallback = getStaticPosts(activeCategory);
        setAllPosts(fallback);
        setTotal(fallback.length);
        setFeatured(fallback[0] || null);
        setDisplayed(fallback.slice(0, PAGE_SIZE));
        setPage(1);
      })
      .finally(() => setLoading(false));

    // log visit
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'logVisit', page: 'blog', category: activeCategory }),
    }).catch(() => {});
  }, [activeCategory]);

  const loadMore = () => {
    const next = page + 1;
    setDisplayed(allPosts.slice(0, next * PAGE_SIZE));
    setPage(next);
  };

  const featuredTitle = featured?.title || 'Style Beyond the Basics';
  const featuredSlug  = featured?.slug  || 'style-beyond-the-basics';

  return (
    <Layout disablePaddingBottom>
      <div className={styles.root}>
        {/* ── Hero ───────────────────────────────────── */}
        <Hero
          maxWidth={'400px'}
          image={toOptimizedImage('/blogCover.png')}
          title={featuredTitle}
          ctaLink={'read story'}
          ctaTo={`/blog/${featuredSlug}`}
          header={'featured'}
        />

        {/* ── Category nav ────────────────────────────── */}
        <div className={styles.navContainer}>
          {CATEGORIES.map((cat) => (
            <ThemeLink
              key={cat.key}
              isActive={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
              to={`#${cat.key}`}
            >
              {cat.label}
            </ThemeLink>
          ))}
        </div>

        {/* ── Blog grid ───────────────────────────────── */}
        <div className={styles.blogsContainer}>
          <Container size={'large'}>
            {loading ? (
              <p className={styles.loadingText}>Loading posts…</p>
            ) : displayed.length === 0 ? (
              <p className={styles.emptyText}>No posts in this category yet. Check back soon!</p>
            ) : (
              <BlogPreviewGrid data={displayed} hideReadMoreOnWeb showExcerpt />
            )}
          </Container>
        </div>

        {/* ── Load more ───────────────────────────────── */}
        {!loading && displayed.length < total && (
          <div className={styles.loadMoreContainer}>
            <span>{displayed.length} of {total}</span>
            <Button fullWidth level={'secondary'} onClick={loadMore}>
              LOAD MORE
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// ── Static fallback posts (shown if Apps Script is not yet deployed) ─────────
function getStaticPosts(category) {
  const posts = [
    {
      slug:     'how-to-style-a-plain-tshirt',
      title:    'How to Style a Plain T-Shirt 5 Different Ways',
      category: 'style',
      date:     'March 2025',
      image:    '/blogFeatured.png',
      excerpt:  'A plain tee is the most versatile piece in your wardrobe. Here are five outfits you can build around a single colour.',
    },
    {
      slug:     'washing-your-cotton-tshirt',
      title:    'The Right Way to Wash Your Cotton T-Shirt',
      category: 'care',
      date:     'February 2025',
      image:    '/cloth.png',
      excerpt:  'Improper washing is the fastest way to ruin a good tee. Follow these simple steps to keep your cotton looking new for longer.',
    },
    {
      slug:     'why-we-chose-combed-cotton',
      title:    'Why We Use 100% Combed Cotton',
      category: 'behind',
      date:     'January 2025',
      image:    '/collections/collection1.png',
      excerpt:  'Combed cotton removes short fibres and impurities, leaving only the longest, smoothest strands — the reason our tees feel different.',
    },
    {
      slug:     'new-summer-colours',
      title:    'Introducing Our New Summer Colour Range',
      category: 'news',
      date:     'December 2024',
      image:    '/blogFeatured.png',
      excerpt:  'Six new shades — from warm sand to deep slate — are now live in the shop. Find your summer essential.',
    },
    {
      slug:     'capsule-wardrobe-basics',
      title:    'Building a Capsule Wardrobe Around Basics',
      category: 'style',
      date:     'November 2024',
      image:    '/cloth.png',
      excerpt:  'A capsule wardrobe starts with the right basics. We show you how 3 plain tees can anchor 15 different outfits.',
    },
    {
      slug:     'fabric-shrinkage-guide',
      title:    'Why Cotton Shrinks and How to Prevent It',
      category: 'care',
      date:     'October 2024',
      image:    '/collections/collection1.png',
      excerpt:  'All cotton shrinks — but how much depends entirely on how you treat it. Here is everything you need to know.',
    },
  ];

  return category === 'all' ? posts : posts.filter((p) => p.category === category);
}

export default BlogPage;
