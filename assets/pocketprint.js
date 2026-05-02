/* PocketPrint — Shopify OS 2.0 JavaScript */
(function () {
  'use strict';

  // ——— Scroll reveal ———
  function initReveal() {
    const els = document.querySelectorAll('[data-pp-reveal]:not(.pp-in)');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('pp-in'), i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '80px 0px -20px 0px' });

    els.forEach(el => io.observe(el));

    // Fallback: force-reveal anything still hidden after 1.8s
    setTimeout(() => {
      document.querySelectorAll('[data-pp-reveal]:not(.pp-in)').forEach((el, i) => {
        setTimeout(() => el.classList.add('pp-in'), i * 30);
      });
    }, 1800);
  }

  // ——— Magnetic buttons ———
  function initMagnetic() {
    document.querySelectorAll('.pp-btn:not([data-pp-mag])').forEach(btn => {
      btn.dataset.ppMag = '1';
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ——— FAQ accordion ———
  function initFaq() {
    document.querySelectorAll('.pp-faq-item:not([data-pp-faq])').forEach(item => {
      item.dataset.ppFaq = '1';
      item.addEventListener('click', () => item.classList.toggle('pp-open'));
    });
  }

  // ——— Color picker ———
  function initColorPicker() {
    const pills = document.querySelectorAll('.pp-color-pill:not([data-pp-bound])');
    if (!pills.length) return;
    pills.forEach(pill => {
      pill.dataset.ppBound = '1';
      pill.addEventListener('click', () => {
        document.querySelectorAll('.pp-color-pill').forEach(p => p.classList.remove('pp-active'));
        pill.classList.add('pp-active');
        const label = document.getElementById('pp-sel-color');
        if (label) label.textContent = pill.dataset.color;
        const h1 = pill.dataset.hex1, h2 = pill.dataset.hex2;
        const g1 = document.querySelector('#pp-bodyGrad stop:first-child');
        const g2 = document.querySelector('#pp-bodyGrad stop:last-child');
        const c1 = document.querySelector('#pp-centerGrad stop:first-child');
        const c2 = document.querySelector('#pp-centerGrad stop:last-child');
        if (g1 && h1) { g1.setAttribute('stop-color', h1); g2.setAttribute('stop-color', h2); }
        if (c1 && h1) { c1.setAttribute('stop-color', h1); c2.setAttribute('stop-color', h2); }
        syncVariant();
      });
    });
  }

  // ——— Bundle picker ———
  window.ppCurrentPrice = null;

  function initBundlePicker() {
    const pills = document.querySelectorAll('.pp-bundle-pill:not([data-pp-bound])');
    if (!pills.length) return;
    const activePill = document.querySelector('.pp-bundle-pill.pp-active') || pills[0];
    if (activePill) updatePriceDisplay(activePill);

    pills.forEach(pill => {
      pill.dataset.ppBound = '1';
      pill.addEventListener('click', () => {
        document.querySelectorAll('.pp-bundle-pill').forEach(p => p.classList.remove('pp-active'));
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
    if (!variantId) return;
    const variant = (window.ppVariants || []).find(v => v.id == variantId);
    if (!variant) return;
    window.ppCurrentPrice = variant.price;
    const raw = formatMoneyRaw(variant.price);
    const rich = formatMoney(variant.price);
    const priceEl = document.getElementById('pp-disp-price');
    const ctaEl = document.getElementById('pp-cta-price');
    const stickyEl = document.getElementById('pp-sticky-price');
    if (priceEl) priceEl.innerHTML = rich;
    if (ctaEl) ctaEl.textContent = raw;
    if (stickyEl) stickyEl.textContent = raw + ' · Free shipping';
  }

  function formatMoney(cents) {
    const [int, dec] = (cents / 100).toFixed(2).split('.');
    return `<span>${window.ppMoneyFormat || '€'}${int}</span><span class="pp-buy-price-cents">.${dec}</span>`;
  }

  function formatMoneyRaw(cents) {
    return (window.ppMoneyFormat || '€') + (cents / 100).toFixed(2);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ——— Variant syncing ———
  function syncVariant() {
    const variantInput = document.getElementById('pp-variant-id');
    if (!variantInput) return;
    const colorPill  = document.querySelector('.pp-color-pill.pp-active');
    const bundlePill = document.querySelector('.pp-bundle-pill.pp-active');
    const variants   = window.ppVariants || [];
    let match;

    if (colorPill && bundlePill) {
      const color  = colorPill.dataset.color;
      const bundle = bundlePill.dataset.bundle;
      match = variants.find(v => (v.options || []).includes(color) && (v.options || []).includes(bundle));
    } else if (bundlePill) {
      match = variants.find(v => v.id == bundlePill.dataset.variantId);
    }

    if (match) {
      variantInput.value = match.id;
      window.ppSelectedVariantId = match.id;
      if (match.price) {
        const raw  = formatMoneyRaw(match.price);
        const rich = formatMoney(match.price);
        window.ppCurrentPrice = match.price;
        const priceEl  = document.getElementById('pp-disp-price');
        const ctaEl    = document.getElementById('pp-cta-price');
        const stickyEl = document.getElementById('pp-sticky-price');
        if (priceEl)  priceEl.innerHTML = rich;
        if (ctaEl)    ctaEl.textContent = raw;
        if (stickyEl) stickyEl.textContent = raw + ' · Free shipping';
      }
    }
  }

  // ——— Quantity controls ———
  function initQuantity() {
    const minus   = document.getElementById('pp-qty-minus');
    const plus    = document.getElementById('pp-qty-plus');
    const display = document.getElementById('pp-qty-display');
    const input   = document.getElementById('pp-qty-input');
    if (!minus || !plus || !input || minus.dataset.ppBound) return;
    minus.dataset.ppBound = '1';
    plus.dataset.ppBound  = '1';

    function set(val) {
      input.value = val;
      if (display) display.textContent = val;
      minus.disabled     = val <= 1;
      minus.style.opacity = val <= 1 ? '.35' : '1';
    }
    set(parseInt(input.value) || 1);

    minus.addEventListener('click', () => set(Math.max(1, parseInt(input.value || 1) - 1)));
    plus.addEventListener('click',  () => set(parseInt(input.value || 1) + 1));
  }

  // ——— Shopify AJAX Cart ———
  function initCart() {
    refreshCartCount();
    refreshCartDrawer();

    const atcBtn = document.getElementById('pp-add-to-cart');
    if (atcBtn && !atcBtn.dataset.ppBound) {
      atcBtn.dataset.ppBound = '1';
      atcBtn.addEventListener('click', handleAddToCart);
    }

    const stickyAtc = document.getElementById('pp-sticky-atc');
    if (stickyAtc && !stickyAtc.dataset.ppBound) {
      stickyAtc.dataset.ppBound = '1';
      stickyAtc.addEventListener('click', handleAddToCart);
    }

    document.querySelectorAll('[data-pp-cart-toggle]:not([data-pp-bound])').forEach(el => {
      el.dataset.ppBound = '1';
      el.addEventListener('click', toggleCart);
    });

    const overlay = document.getElementById('pp-cart-overlay');
    if (overlay && !overlay.dataset.ppBound) {
      overlay.dataset.ppBound = '1';
      overlay.addEventListener('click', closeCart);
    }

    const closeBtn = document.getElementById('pp-cart-close');
    if (closeBtn && !closeBtn.dataset.ppBound) {
      closeBtn.dataset.ppBound = '1';
      closeBtn.addEventListener('click', closeCart);
    }

    const checkoutBtn = document.getElementById('pp-cart-checkout');
    if (checkoutBtn && !checkoutBtn.dataset.ppBound) {
      checkoutBtn.dataset.ppBound = '1';
      checkoutBtn.addEventListener('click', () => { window.location.href = '/checkout'; });
    }
  }

  function handleAddToCart(e) {
    if (e) e.preventDefault();
    const variantInput = document.getElementById('pp-variant-id');
    if (!variantInput || !variantInput.value) {
      console.warn('PocketPrint: no variant selected');
      return;
    }
    const qty = Math.max(1, parseInt(document.getElementById('pp-qty-input')?.value || 1));
    const sectionEl = document.querySelector('[data-pp-section]');
    const atcBtn    = document.getElementById('pp-add-to-cart');
    if (sectionEl) sectionEl.classList.add('pp-loading');
    if (atcBtn)    atcBtn.disabled = true;

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: parseInt(variantInput.value), quantity: qty })
    })
      .then(r => r.json())
      .then(data => {
        if (data.status) { console.error('Cart error:', data.description); return; }
        refreshCartCount();
        refreshCartDrawer();
        openCart();
      })
      .catch(err => console.error('PocketPrint cart error:', err))
      .finally(() => {
        if (sectionEl) sectionEl.classList.remove('pp-loading');
        if (atcBtn)    atcBtn.disabled = false;
      });
  }

  function refreshCartCount() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(cart => {
        const el = document.getElementById('pp-cart-count');
        if (el) el.textContent = '· ' + cart.item_count;
      });
  }

  function refreshCartDrawer() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(renderCartDrawer);
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
          ${item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.product_title)}" loading="lazy">`
            : '<svg viewBox="0 0 40 40" style="width:30px"><circle cx="20" cy="20" r="14" fill="white" opacity=".7"/><circle cx="20" cy="20" r="9" fill="#e85a85"/></svg>'}
        </div>
        <div class="pp-cart-line-info">
          <div class="pp-cart-line-name">${escapeHtml(item.product_title)}</div>
          <div class="pp-cart-line-meta">${item.variant_title !== 'Default Title' ? escapeHtml(item.variant_title) + ' · ' : ''}Qty ${item.quantity}</div>
        </div>
        <div class="pp-cart-line-price">${formatMoneyRaw(item.final_price * item.quantity)}</div>
      </div>
    `).join('');
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
    if (!sticky || window._ppStickyBound) return;
    window._ppStickyBound = true;
    window.addEventListener('scroll', () => {
      sticky.classList.toggle('pp-visible', window.scrollY > 600);
    }, { passive: true });
  }

  // ——— Drag-scroll for review cards ———
  function initDragScroll() {
    document.querySelectorAll('.pp-tiktok-row:not([data-pp-drag])').forEach(el => {
      el.dataset.ppDrag = '1';
      let isDown = false, startX = 0, scrollLeft = 0;
      el.addEventListener('mousedown', e => {
        isDown = true;
        el.classList.add('pp-dragging');
        startX = e.pageX - el.getBoundingClientRect().left;
        scrollLeft = el.scrollLeft;
      });
      document.addEventListener('mouseup', () => {
        isDown = false;
        el.classList.remove('pp-dragging');
      });
      el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        el.scrollLeft = scrollLeft - (e.pageX - el.getBoundingClientRect().left - startX) * 1.2;
      });
    });
  }

  // ——— Init ———
  function init() {
    initReveal();
    initMagnetic();
    initFaq();
    initColorPicker();
    initBundlePicker();
    initQuantity();
    initCart();
    initStickyCta();
    initDragScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Reinit when Shopify editor loads/reloads a section
  document.addEventListener('shopify:section:load', init);

})();
