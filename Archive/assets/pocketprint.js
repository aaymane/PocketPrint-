/* PocketPrint — Shopify Dawn Theme JavaScript */
(function () {
  'use strict';

  // ——— Scroll reveal ———
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('pp-in'), i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('[data-pp-reveal]').forEach(el => io.observe(el));
  }

  // ——— Magnetic buttons ———
  function initMagnetic() {
    document.querySelectorAll('.pp-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ——— FAQ accordion ———
  function initFaq() {
    document.querySelectorAll('.pp-faq-item').forEach(item => {
      item.addEventListener('click', () => item.classList.toggle('pp-open'));
    });
  }

  // ——— Speed dot grid ———
  function initSpeedDots() {
    const vis = document.getElementById('pp-speed-vis');
    if (!vis) return;
    const rows = 8, cols = 16;
    for (let i = 0; i < rows * cols; i++) vis.appendChild(document.createElement('div'));
    const cells = vis.children;
    let frame = 0;
    setInterval(() => {
      frame++;
      for (let i = 0; i < cells.length; i++) {
        const col = i % cols;
        const wave = Math.sin((col + frame * 0.5) * 0.5) * 0.5 + 0.5;
        cells[i].classList.toggle('pp-on', wave > 0.6);
      }
    }, 100);
  }

  // ——— Color picker ———
  function initColorPicker() {
    const pills = document.querySelectorAll('.pp-color-pill');
    if (!pills.length) return;
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('pp-active'));
        pill.classList.add('pp-active');
        const label = document.getElementById('pp-sel-color');
        if (label) label.textContent = pill.dataset.color;

        // Update SVG product gradient colours
        const h1 = pill.dataset.hex1, h2 = pill.dataset.hex2;
        const g1 = document.querySelector('#pp-bodyGrad stop:first-child');
        const g2 = document.querySelector('#pp-bodyGrad stop:last-child');
        const c1 = document.querySelector('#pp-centerGrad stop:first-child');
        const c2 = document.querySelector('#pp-centerGrad stop:last-child');
        if (g1 && h1) { g1.setAttribute('stop-color', h1); g2.setAttribute('stop-color', h2); }
        if (c1 && h1) { c1.setAttribute('stop-color', h1); c2.setAttribute('stop-color', h2); }

        // Sync variant selector if product form present
        syncVariant();
      });
    });
  }

  // ——— Bundle picker ———
  window.ppCurrentPrice = null;

  function initBundlePicker() {
    const pills = document.querySelectorAll('.pp-bundle-pill');
    if (!pills.length) return;
    const activePill = document.querySelector('.pp-bundle-pill.pp-active') || pills[0];
    if (activePill) updatePriceDisplay(activePill);

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('pp-active'));
        pill.classList.add('pp-active');
        const label = document.getElementById('pp-sel-bundle');
        const bundleName = pill.querySelector('.pp-bundle-name');
        if (label && bundleName) label.textContent = bundleName.textContent;
        updatePriceDisplay(pill);
        syncVariant();
      });
    });
  }

  function updatePriceDisplay(pill) {
    const variantId = pill.dataset.variantId;
    const priceEl = document.getElementById('pp-disp-price');
    const ctaPriceEl = document.getElementById('pp-cta-price');
    const stickyPriceEl = document.getElementById('pp-sticky-price');

    if (variantId) {
      const variants = window.ppVariants || [];
      const variant = variants.find(v => v.id == variantId);
      if (variant) {
        window.ppCurrentPrice = variant.price;
        const formatted = formatMoney(variant.price);
        if (priceEl) priceEl.innerHTML = formatted;
        if (ctaPriceEl) ctaPriceEl.textContent = formatted;
        if (stickyPriceEl) stickyPriceEl.textContent = formatted + ' · Free shipping';
      }
    }
  }

  function formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    const [int, dec] = amount.split('.');
    return `<span>${window.ppMoneyFormat || '€'}${int}</span><span class="pp-buy-price-cents">.${dec}</span>`;
  }

  // ——— Variant syncing (Shopify product variants) ———
  function syncVariant() {
    const colorPill = document.querySelector('.pp-color-pill.pp-active');
    const bundlePill = document.querySelector('.pp-bundle-pill.pp-active');
    if (!colorPill || !bundlePill) return;

    const color = colorPill.dataset.color;
    const bundle = bundlePill.dataset.bundle;
    const variants = window.ppVariants || [];

    const match = variants.find(v => {
      const opts = v.options || [];
      return opts.includes(color) && opts.includes(bundle);
    });

    const variantInput = document.getElementById('pp-variant-id');
    if (match && variantInput) {
      variantInput.value = match.id;
      window.ppSelectedVariantId = match.id;
      // Update price from matched variant
      if (match.price) {
        const priceEl = document.getElementById('pp-disp-price');
        const ctaPriceEl = document.getElementById('pp-cta-price');
        const stickyPriceEl = document.getElementById('pp-sticky-price');
        const formatted = formatMoney(match.price);
        window.ppCurrentPrice = match.price;
        if (priceEl) priceEl.innerHTML = formatted;
        if (ctaPriceEl) ctaPriceEl.textContent = (match.price / 100).toFixed(2);
        if (stickyPriceEl) stickyPriceEl.textContent = (match.price / 100).toFixed(2) + ' · Free shipping';
      }
    }
  }

  // ——— Shopify AJAX Cart ———
  function initCart() {
    refreshCartCount();
    refreshCartDrawer();

    // Add-to-cart button
    const atcBtn = document.getElementById('pp-add-to-cart');
    if (atcBtn) {
      atcBtn.addEventListener('click', handleAddToCart);
    }

    // Sticky add-to-cart
    const stickyAtcBtn = document.getElementById('pp-sticky-atc');
    if (stickyAtcBtn) {
      stickyAtcBtn.addEventListener('click', handleAddToCart);
    }

    // Cart toggle
    document.querySelectorAll('[data-pp-cart-toggle]').forEach(el => {
      el.addEventListener('click', toggleCart);
    });

    // Cart overlay close
    const overlay = document.getElementById('pp-cart-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    // Cart close btn
    const closeBtn = document.getElementById('pp-cart-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    // Cart checkout
    const checkoutBtn = document.getElementById('pp-cart-checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { window.location.href = '/checkout'; });
  }

  function handleAddToCart() {
    const variantInput = document.getElementById('pp-variant-id');
    if (!variantInput || !variantInput.value) {
      console.warn('PocketPrint: No variant ID selected');
      return;
    }

    const sectionEl = document.querySelector('[data-pp-section]');
    if (sectionEl) sectionEl.classList.add('pp-loading');

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: parseInt(variantInput.value), quantity: 1 })
    })
      .then(r => r.json())
      .then(() => {
        refreshCartCount();
        refreshCartDrawer();
        openCart();
      })
      .catch(err => console.error('PocketPrint cart error:', err))
      .finally(() => {
        if (sectionEl) sectionEl.classList.remove('pp-loading');
      });
  }

  function refreshCartCount() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(cart => {
        const countEl = document.getElementById('pp-cart-count');
        if (countEl) countEl.textContent = '· ' + cart.item_count;
      });
  }

  function refreshCartDrawer() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(cart => renderCartDrawer(cart));
  }

  function renderCartDrawer(cart) {
    const body = document.getElementById('pp-cart-body');
    const foot = document.getElementById('pp-cart-foot');
    if (!body) return;

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="pp-cart-empty"><p>Your cart is light as a PocketPrint.</p><p>Add one and feel the difference.</p></div>';
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = 'block';
    const totalEl = document.getElementById('pp-cart-total');
    if (totalEl) totalEl.textContent = formatMoneyRaw(cart.total_price);

    body.innerHTML = cart.items.map(item => `
      <div class="pp-cart-line">
        <div class="pp-cart-line-img">
          ${item.image ? `<img src="${item.image}" alt="${item.product_title}" loading="lazy">` : `<svg viewBox="0 0 40 40" style="width:30px"><circle cx="20" cy="20" r="14" fill="white" opacity=".7"/><circle cx="20" cy="20" r="9" fill="#e85a85"/></svg>`}
        </div>
        <div class="pp-cart-line-info">
          <div class="pp-cart-line-name">${item.product_title}</div>
          <div class="pp-cart-line-meta">${item.variant_title !== 'Default Title' ? item.variant_title : ''} · Qty ${item.quantity}</div>
        </div>
        <div class="pp-cart-line-price">${formatMoneyRaw(item.final_price * item.quantity)}</div>
      </div>
    `).join('');
  }

  function formatMoneyRaw(cents) {
    return (window.ppMoneyFormat || '€') + (cents / 100).toFixed(2);
  }

  function openCart() {
    document.getElementById('pp-cart-drawer')?.classList.add('pp-open');
    document.getElementById('pp-cart-overlay')?.classList.add('pp-open');
  }

  function closeCart() {
    document.getElementById('pp-cart-drawer')?.classList.remove('pp-open');
    document.getElementById('pp-cart-overlay')?.classList.remove('pp-open');
  }

  function toggleCart() {
    const drawer = document.getElementById('pp-cart-drawer');
    if (drawer?.classList.contains('pp-open')) closeCart();
    else { refreshCartDrawer(); openCart(); }
  }

  // ——— Sticky mobile CTA ———
  function initStickyCta() {
    const sticky = document.getElementById('pp-sticky-cta');
    if (!sticky) return;
    window.addEventListener('scroll', () => {
      sticky.classList.toggle('pp-visible', window.scrollY > 600);
    }, { passive: true });
  }

  // ——— Init on DOM ready ———
  function init() {
    initReveal();
    initMagnetic();
    initFaq();
    initSpeedDots();
    initColorPicker();
    initBundlePicker();
    initCart();
    initStickyCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
