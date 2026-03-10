import { Link, navigate } from 'gatsby';
import React, { useState, useEffect } from 'react';

import Brand from '../components/Brand';
import CartItem from '../components/CartItem';
import Container from '../components/Container';
import Footer from '../components/Footer';
import Icon from '../components/Icons/Icon';
import OrderSummary from '../components/OrderSummary';

import * as styles from './cart.module.css';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const RAZORPAY_KEY    = 'rzp_live_S19g6nMCtxHuna';
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';
// ────────────────────────────────────────────────────────────────────────────

const SHIPPING_COST = 99;   // ₹99 flat shipping
const FREE_ABOVE    = 999;  // free shipping above ₹999

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

const CartPage = () => {
  const [cartItems,  setCartItems]  = useState([]);
  const [processing, setProcessing] = useState(false);

  // ── read cart from localStorage ─────────────────────────────────────
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(stored);
    } catch (_) {
      setCartItems([]);
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const handleRemove = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const handleQuantityChange = (index, delta) => {
    const updated = cartItems.map((item, i) => {
      if (i !== index) return item;
      const qty = Math.max(1, (item.quantity || 1) + delta);
      return { ...item, quantity: qty };
    });
    saveCart(updated);
  };

  // ── price calculations ──────────────────────────────────────────────
  const subtotal  = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shipping  = subtotal >= FREE_ABOVE ? 0 : SHIPPING_COST;
  const total     = subtotal + shipping;

  // ── Razorpay checkout ───────────────────────────────────────────────
  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { navigate('/login'); return; }
    if (cartItems.length === 0) return;

    setProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) { alert('Payment gateway failed to load. Please try again.'); setProcessing(false); return; }

    // Create order on Apps Script to get Razorpay order_id
    let razorpayOrderId = null;
    try {
      const res  = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action:   'createRazorpayOrder',
          amount:   total,
          currency: 'INR',
          receipt:  `order_${Date.now()}`,
        }),
      });
      const data = await res.json();
      razorpayOrderId = data.id;
    } catch (_) {}

    const options = {
      key:          RAZORPAY_KEY,
      amount:       total * 100,           // paise
      currency:     'INR',
      name:         'Your Store',
      description:  'Plain T-Shirt Order',
      order_id:     razorpayOrderId || undefined,
      prefill: {
        name:  `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        contact: user.phone || '',
      },
      theme: { color: '#B59F66' },
      handler: async (response) => {
        // Payment successful — save order to Google Sheets
        const orderPayload = {
          action:            'createOrder',
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId:   response.razorpay_order_id   || razorpayOrderId,
          razorpaySignature: response.razorpay_signature  || '',
          user:              user,
          items:             cartItems,
          subtotal,
          shipping,
          total,
          currency:          'INR',
          status:            'Placed',
          createdAt:         new Date().toISOString(),
        };

        try {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(orderPayload),
          });
        } catch (_) {}

        // Clear cart and redirect
        localStorage.removeItem('cart');
        navigate('/orderConfirm');
      },
      modal: {
        ondismiss: () => setProcessing(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      alert(`Payment failed: ${response.error.description}`);
      setProcessing(false);
    });
    rzp.open();
  };

  const user    = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const isEmpty = cartItems.length === 0;

  return (
    <div>
      <div className={styles.contentContainer}>
        <Container size={'large'} spacing={'min'}>
          {/* Header */}
          <div className={styles.headerContainer}>
            <div className={styles.shoppingContainer}>
              <Link className={styles.shopLink} to={'/shop'}>
                <Icon symbol={'arrow'} />
                <span className={styles.continueShopping}>Continue Shopping</span>
              </Link>
            </div>
            <Brand />
            <div className={styles.loginContainer}>
              {user
                ? <Link to={'/account'}>{user.firstName || 'Account'}</Link>
                : <Link to={'/login'}>Login</Link>}
            </div>
          </div>

          {/* Content */}
          <div className={styles.summaryContainer}>
            <h3>My Bag</h3>

            {isEmpty ? (
              <div className={styles.emptyCart}>
                <p>Your bag is empty.</p>
                <Link to={'/shop'} className={styles.shopLink}>Browse T-Shirts →</Link>
              </div>
            ) : (
              <div className={styles.cartContainer}>
                <div className={styles.cartItemsContainer}>
                  {cartItems.map((item, index) => (
                    <div key={index} className={styles.cartItemWrapper}>
                      <CartItem
                        image={item.image}
                        alt={item.name}
                        name={item.name}
                        price={item.price}
                        color={item.color}
                        size={item.size}
                        quantity={item.quantity || 1}
                      />
                      <div className={styles.itemActions}>
                        <div className={styles.qtyControl}>
                          <button onClick={() => handleQuantityChange(index, -1)}>−</button>
                          <span>{item.quantity || 1}</span>
                          <button onClick={() => handleQuantityChange(index, +1)}>+</button>
                        </div>
                        <button className={styles.removeBtn} onClick={() => handleRemove(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary panel */}
                <div>
                  <div className={styles.summaryBox}>
                    <h4>Order Summary</h4>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    {shipping === 0 && (
                      <div className={styles.freeShipNote}>🎉 You qualify for free shipping!</div>
                    )}
                    {shipping > 0 && (
                      <div className={styles.freeShipNote}>
                        Add ₹{(FREE_ABOVE - subtotal).toLocaleString('en-IN')} more for free shipping
                      </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Total (INR)</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      className={styles.checkoutBtn}
                      onClick={handleCheckout}
                      disabled={processing}
                    >
                      {processing ? 'Processing…' : 'Checkout with Razorpay'}
                    </button>
                    <p className={styles.secureNote}>🔒 Secured by Razorpay</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
