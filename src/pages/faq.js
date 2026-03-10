import React from 'react';
import * as styles from './faq.module.css';

import Layout from '../components/Layout/Layout';
import Banner from '../components/Banner';
import Container from '../components/Container';

const FaqPage = () => {
  return (
    <Layout>
      <div className={styles.root}>
        <Banner
          maxWidth={'650px'}
          name={`Frequently Asked Questions`}
          bgImage={'/faqCover.png'}
          color={'var(--standard-white)'}
          height={'350px'}
        />

        <Container>
          {/* ── Orders ──────────────────────────────────── */}
          <div className={styles.section}>
            <span>Your Orders</span>

            <div className={styles.subSection}>
              <h3>How do I track my order?</h3>
              <p>
                Once your order is dispatched you will receive a shipping confirmation email with a tracking link. You can also visit the <strong>My Orders</strong> section in your account to check the current status — Placed, Shipped, On the Way, or Delivered.
              </p>
              <p>
                If you haven&rsquo;t received a confirmation email within 24 hours of placing your order, please check your spam or junk folder. Still nothing? Email us at <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a>.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>How long does delivery take?</h3>
              <p>
                We dispatch all orders within 1–2 business days. Standard delivery within India typically takes 4–7 business days depending on your location. You will receive tracking details once your order has shipped.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>Can I cancel or modify my order?</h3>
              <p>
                Orders can be cancelled or modified within 12 hours of being placed. Please contact us immediately at <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a> with your order ID. Once dispatched, cancellations are no longer possible.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>Returns &amp; Exchanges</h3>
              <p>
                We accept returns within 7 days of delivery for items that are unused, unwashed, and in their original condition with tags attached. To initiate a return, email us at <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a> with your order ID and reason for return.
              </p>
              <p>
                Exchanges are processed after we receive and inspect the returned item. Refunds are credited to the original payment method within 5–7 business days of approval.
              </p>
            </div>
          </div>

          {/* ── Payment ─────────────────────────────────── */}
          <div className={styles.section}>
            <span>Payment &amp; Pricing</span>

            <div className={styles.subSection}>
              <h3>What payment methods do you accept?</h3>
              <p>
                We accept all major payment methods via Razorpay — including UPI, credit cards, debit cards, net banking, and popular wallets like Paytm and PhonePe. All transactions are secured with 256-bit SSL encryption.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>What currency are prices shown in?</h3>
              <p>
                All prices on our website are displayed in <strong>Indian Rupees (₹ INR)</strong>. The price you see at checkout is the exact amount you will be charged — no hidden fees or conversion charges.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>Is there a shipping charge?</h3>
              <p>
                We charge a flat shipping fee of <strong>₹99</strong> on orders below ₹999. Orders above ₹999 qualify for <strong>free shipping</strong> automatically — no coupon needed.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>What if my payment fails?</h3>
              <p>
                If your payment is deducted but your order is not confirmed, please do not attempt to pay again. Contact us at <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a> with your email address and transaction reference. We will investigate and resolve within 24 business hours.
              </p>
            </div>
          </div>

          {/* ── Products ────────────────────────────────── */}
          <div className={styles.section}>
            <span>Products &amp; Sizing</span>

            <div className={styles.subSection}>
              <h3>What sizes do you offer?</h3>
              <p>
                Our plain t-shirts are available in sizes XS, S, M, L, and XL. We recommend checking the size guide on each product page before ordering. If you are between sizes, we suggest sizing up for a relaxed fit.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>What fabric are the t-shirts made of?</h3>
              <p>
                Our t-shirts are made from 100% combed cotton, chosen for its softness, breathability, and durability. Each piece is pre-shrunk to maintain its shape after washing.
              </p>
            </div>

            <div className={styles.subSection}>
              <h3>How do I care for my t-shirt?</h3>
              <p>
                Machine wash cold (30°C) with similar colours. Do not bleach. Tumble dry on low or air dry flat. Iron on low heat if needed. Avoid wringing to preserve shape.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default FaqPage;
