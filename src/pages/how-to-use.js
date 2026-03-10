import React, { useRef } from 'react';
import * as styles from './about.module.css';

import Layout from '../components/Layout/Layout';
import ThemeLink from '../components/ThemeLink';
import Container from '../components/Container';
import { navigate } from 'gatsby';
import Button from '../components/Button';

const HowToUsePage = () => {
  const orderRef    = useRef();
  const paymentRef  = useRef();
  const trackRef    = useRef();
  const returnRef   = useRef();

  const handleScroll = (ref) => {
    if (ref?.current) {
      window.scrollTo({ behavior: 'smooth', top: ref.current.offsetTop - 280 });
    }
  };

  return (
    <Layout>
      <div className={styles.root}>
        {/* ── Sticky nav ─────────────────────────────── */}
        <div className={styles.navContainer}>
          <ThemeLink onClick={() => handleScroll(orderRef)}   to={'#how-to-order'}>How to Order</ThemeLink>
          <ThemeLink onClick={() => handleScroll(paymentRef)} to={'#payment'}>Payment</ThemeLink>
          <ThemeLink onClick={() => handleScroll(trackRef)}   to={'#tracking'}>Tracking</ThemeLink>
          <ThemeLink onClick={() => handleScroll(returnRef)}  to={'#returns'}>Returns</ThemeLink>
        </div>

        <Container size={'large'} spacing={'min'}>
          <div className={styles.content} style={{ paddingTop: '80px' }}>

            {/* ── How to Order ──────────────────────────── */}
            <h3 ref={orderRef} id={'how-to-order'}>How to Order</h3>
            <p>Ordering from us is simple and takes just a few minutes.</p>
            <ol>
              <li><strong>Browse</strong> — Visit our <Button href={'/shop'} onClick={() => navigate('/shop')}>Shop</Button> page to explore our plain t-shirt collection.</li>
              <li><strong>Select</strong> — Choose your preferred colour and size. Refer to the size guide on each product page if unsure.</li>
              <li><strong>Add to Bag</strong> — Click &ldquo;Add to Cart&rdquo; and review your bag. You can adjust quantities or remove items any time.</li>
              <li><strong>Create an Account</strong> — You need a free account to place an order. <Button href={'/signup'} onClick={() => navigate('/signup')}>Sign up here</Button> — it takes under a minute using just your email and a one-time code.</li>
              <li><strong>Checkout</strong> — Proceed to checkout, confirm your delivery address, and pay securely via Razorpay.</li>
            </ol>
            <p>
              All prices are in <strong>Indian Rupees (₹ INR)</strong>. Free shipping applies automatically on orders above ₹999.
            </p>

            {/* ── Payment ───────────────────────────────── */}
            <h3 ref={paymentRef} id={'payment'} style={{ marginTop: '64px' }}>Payment</h3>
            <p>
              We use <strong>Razorpay</strong> as our payment gateway — one of India&rsquo;s most trusted payment platforms. All transactions are encrypted and secure.
            </p>
            <p>We accept:</p>
            <ul>
              <li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
              <li>Credit Cards &amp; Debit Cards (Visa, Mastercard, RuPay)</li>
              <li>Net Banking (all major Indian banks)</li>
              <li>Popular Wallets</li>
            </ul>
            <p>
              You will receive an order confirmation email immediately after a successful payment. If your payment fails or is deducted without confirmation, email us at <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a>.
            </p>

            {/* ── Tracking ──────────────────────────────── */}
            <h3 ref={trackRef} id={'tracking'} style={{ marginTop: '64px' }}>Tracking Your Order</h3>
            <p>
              After dispatch (within 1–2 business days), you will receive a shipping confirmation email with a tracking link. You can also log into your account and visit <strong>My Orders</strong> to see real-time status updates:
            </p>
            <ul>
              <li><strong>Placed</strong> — Order received and confirmed</li>
              <li><strong>Shipped</strong> — Package handed to courier</li>
              <li><strong>On the Way</strong> — Out for delivery in your area</li>
              <li><strong>Delivered</strong> — Package delivered to your address</li>
              <li><strong>Cancelled</strong> — Order cancelled (refund initiated if applicable)</li>
            </ul>
            <p>
              You will receive an email notification each time your order status changes.
            </p>

            {/* ── Returns ───────────────────────────────── */}
            <h3 ref={returnRef} id={'returns'} style={{ marginTop: '64px' }}>Returns &amp; Refunds</h3>
            <p>
              We have a <strong>7-day return policy</strong> from the date of delivery. Items must be unused, unwashed, and in their original condition with tags attached.
            </p>
            <p>To initiate a return:</p>
            <ol>
              <li>Email <a href={'mailto:support@yourstore.com'}>support@yourstore.com</a> with your order ID and reason for return.</li>
              <li>Our team will review and respond within 1 business day with return instructions.</li>
              <li>Once we receive and inspect the item, your refund will be processed within 5–7 business days to your original payment method.</li>
            </ol>
            <p style={{ marginTop: '40px' }}>
              Still have questions? Visit our <Button href={'/faq'} onClick={() => navigate('/faq')}>FAQ page</Button> or <Button href={'/support#contact'} onClick={() => navigate('/support#contact')}>Contact Us</Button>.
            </p>

          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default HowToUsePage;
