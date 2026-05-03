/* PocketPrint — Production JavaScript */
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

  // ——— Magnetic buttons (desktop only) ———
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
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

  // ——— FAQ accordion (one open at a time) ———
  function initFaq() {
    document.querySelectorAll('.pp-faq-item:not([data-pp-faq])').forEach(item => {
      item.dataset.ppFaq = '1';
      const question = item.querySelector('.pp-faq-q');
      const handler = () => {
        const isOpen = item.classList.contains('pp-open');
        // Close all siblings
        document.querySelectorAll('.pp-faq-item.pp-open').forEach(other => {
          if (other !== item) other.classList.remove('pp-open');
        });
        item.classList.toggle('pp-open', !isOpen);
      };
      (question || item).addEventListener('click', handler);
      (question || item).addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    });
  }

  // ——— Utility: money formatting ———
  function formatMoney(cents) {
    if (cents == null) return '';
    const sym = window.ppCurrencySymbol || window.ppMoneyFormat || '€';
    const val = cents / 100;
    const [int, dec] = val.toFixed(2).split('.');
    return `<span>${sym}${int}</span><span class="pp-buy-price-cents">.${dec}</span>`;
  }

  function formatMoneyRaw(cents) {
    if (cents == null) return '';
    const sym = window.ppCurrencySymbol || window.ppMoneyFormat || '€';
    const val = cents / 100;
    return sym + (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ——— Update ALL price surfaces from a variant object ———
  function updateAllPriceDisplays(variant) {
    if (!variant) return;

    const priceEl    = document.getElementById('pp-disp-price');
    const ctaEl      = document.getElementById('pp-cta-price');
    const stickyEl   = document.getElementById('pp-sticky-price');
    const compareEl  = document.getElementById('pp-compare-price');
    const discountEl = document.getElementById('pp-buy-discount');
    const atcBtn     = document.getElementById('pp-add-to-cart');
    const atcLabel   = document.getElementById('pp-atc-label');

    if (priceEl)  priceEl.innerHTML = formatMoney(variant.price);
    if (ctaEl)    ctaEl.textContent = formatMoneyRaw(variant.price);
    if (stickyEl) stickyEl.textContent = formatMoneyRaw(variant.price);

    // Compare-at price
    if (compareEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareEl.textContent = formatMoneyRaw(variant.compare_at_price);
        compareEl.style.display = '';
        if (discountEl) {
          const pct = Math.round(
            (variant.compare_at_price - variant.price) / variant.compare_at_price * 100
          );
          discountEl.textContent = `–${pct}%`;
          discountEl.style.display = '';
        }
      } else {
        compareEl.style.display = 'none';
        if (discountEl) discountEl.style.display = 'none';
      }
    }

    // ATC button availability
    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      if (atcLabel) {
        atcLabel.textContent = variant.available
          ? (window.ppAtcLabel || 'Add to Cart')
          : 'Sold Out';
      }
    }

    window.ppCurrentPrice = variant.price;
  }

  // ——— Color picker ———
  function initColorPicker() {
    const pills = document.querySelectorAll('.pp-color-pill:not([data-pp-bound])');
    if (!pills.length) return;
    pills.forEach(pill => {
      pill.dataset.ppBound = '1';
      const activate = () => {
        document.querySelectorAll('.pp-color-pill').forEach(p => {
          p.classList.remove('pp-active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('pp-active');
        pill.setAttribute('aria-pressed', 'true');

        const label = document.getElementById('pp-sel-color');
        if (label) label.textContent = pill.dataset.color;

        // Update inline SVG gradients
        const h1 = pill.dataset.hex1, h2 = pill.dataset.hex2;
        ['#pp-bodyGrad', '#pp-centerGrad'].forEach(id => {
          const g1 = document.querySelector(`${id} stop:first-child`);
          const g2 = document.querySelector(`${id} stop:last-child`);
          if (g1 && h1) g1.setAttribute('stop-color', h1);
          if (g2 && h2) g2.setAttribute('stop-color', h2);
        });

        syncVariant();
      };
      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  // ——— Bundle picker ———
  function initBundlePicker() {
    const pills = document.querySelectorAll('.pp-bundle-pill:not([data-pp-bound])');
    if (!pills.length) return;

    // Ensure at least one pill is active
    if (!document.querySelector('.pp-bundle-pill.pp-active')) {
      pills[0].classList.add('pp-active');
      pills[0].setAttribute('aria-pressed', 'true');
    }

    pills.forEach(pill => {
      pill.dataset.ppBound = '1';
      const activate = () => {
        document.querySelectorAll('.pp-bundle-pill').forEach(p => {
          p.classList.remove('pp-active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('pp-active');
        pill.setAttribute('aria-pressed', 'true');

        const label = document.getElementById('pp-sel-bundle');
        if (label) label.textContent = pill.dataset.bundle;

        syncVariant();
      };
      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  // ——— Variant sync — finds the variant matching current selections ———
  function syncVariant() {
    const variantInput = document.getElementById('pp-variant-id');
    if (!variantInput) return;

    const variants = window.ppVariants || [];
    if (!variants.length) return;

    const colorPill  = document.querySelector('.pp-color-pill.pp-active');
    const bundlePill = document.querySelector('.pp-bundle-pill.pp-active');
    let match;

    if (colorPill && bundlePill) {
      const color  = colorPill.dataset.color;
      const bundle = bundlePill.dataset.bundle;
      // Try exact match on both options
      match = variants.find(v => {
        const opts = v.options || [];
        return opts.indexOf(color) !== -1 && opts.indexOf(bundle) !== -1;
      });
      // Fallback: match only bundle (product might have single option)
      if (!match) {
        match = variants.find(v => (v.options || []).indexOf(bundle) !== -1);
      }
    } else if (bundlePill) {
      // Match by stored variant ID first (most reliable)
      if (bundlePill.dataset.variantId) {
        match = variants.find(v => String(v.id) === String(bundlePill.dataset.variantId));
      }
      if (!match) {
        const bundle = bundlePill.dataset.bundle;
        match = variants.find(v => (v.options || []).indexOf(bundle) !== -1);
      }
    } else if (colorPill) {
      const color = colorPill.dataset.color;
      match = variants.find(v => (v.options || []).indexOf(color) !== -1);
    } else {
      // Default: use first available variant
      match = variants.find(v => v.available) || variants[0];
    }

    if (match) {
      variantInput.value = match.id;
      window.ppSelectedVariantId = match.id;
      updateAllPriceDisplays(match);
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
      const n = Math.max(1, Math.min(99, val));
      input.value = n;
      if (display) display.textContent = n;
      minus.disabled     = n <= 1;
      minus.style.opacity = n <= 1 ? '.3' : '1';
    }
    set(parseInt(input.value) || 1);

    minus.addEventListener('click', () => set(parseInt(input.value || 1) - 1));
    plus.addEventListener('click',  () => set(parseInt(input.value || 1) + 1));
  }

  // ——— Shopify AJAX Cart ———
  function initCart() {
    refreshCartCount();

    const atcBtn = document.getElementById('pp-add-to-cart');
    if (atcBtn && !atcBtn.dataset.ppBound) {
      atcBtn.dataset.ppBound = '1';
      atcBtn.closest('form')?.addEventListener('submit', handleAddToCart);
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

    // Close cart on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCart();
    });
  }

  function handleAddToCart(e) {
    if (e) e.preventDefault();

    const variantInput = document.getElementById('pp-variant-id');
    if (!variantInput || !variantInput.value || variantInput.value === '0') {
      console.warn('PocketPrint: no variant ID available');
      return;
    }

    const qty    = Math.max(1, parseInt(document.getElementById('pp-qty-input')?.value || 1));
    const atcBtn = document.getElementById('pp-add-to-cart');

    if (atcBtn) {
      atcBtn.disabled = true;
      atcBtn.classList.add('pp-loading');
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ id: parseInt(variantInput.value), quantity: qty })
    })
      .then(r => {
        if (!r.ok) return r.json().then(d => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        refreshCartCount();
        openCart();
      })
      .catch(err => {
        console.error('PocketPrint cart error:', err);
        if (atcBtn) {
          atcBtn.disabled = false;
          atcBtn.classList.remove('pp-loading');
        }
      })
      .finally(() => {
        if (atcBtn) {
          atcBtn.disabled = false;
          atcBtn.classList.remove('pp-loading');
        }
      });
  }

  function refreshCartCount() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(cart => {
        const countEl = document.getElementById('pp-cart-count');
        if (countEl) {
          countEl.textContent = cart.item_count > 0 ? `· ${cart.item_count}` : '· 0';
        }
        const badgeEl = document.getElementById('pp-cart-drawer-count');
        if (badgeEl) {
          badgeEl.textContent = cart.item_count;
          badgeEl.style.display = cart.item_count > 0 ? '' : 'none';
        }
      })
      .catch(() => {});
  }

  function refreshCartDrawer() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => r.json())
      .then(renderCartDrawer)
      .catch(() => {});
  }

  function renderCartDrawer(cart) {
    const body  = document.getElementById('pp-cart-body');
    const foot  = document.getElementById('pp-cart-foot');
    if (!body) return;

    if (!cart || cart.item_count === 0) {
      body.innerHTML = `
        <div class="pp-cart-empty">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
            <path d="M14 20h20l-2.5 10H16.5L14 20z" stroke-linejoin="round"/>
            <path d="M14 20l-2-6H8" stroke-linecap="round"/>
            <circle cx="18" cy="34" r="2" fill="currentColor" stroke="none"/>
            <circle cx="30" cy="34" r="2" fill="currentColor" stroke="none"/>
          </svg>
          <p>Nothing here yet.</p>
          <span>Add a PocketPrint to start.</span>
        </div>`;
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = '';

    const totalEl = document.getElementById('pp-cart-total');
    if (totalEl) totalEl.textContent = formatMoneyRaw(cart.total_price);

    const badgeEl = document.getElementById('pp-cart-drawer-count');
    if (badgeEl) {
      badgeEl.textContent = cart.item_count;
      badgeEl.style.display = '';
    }

    body.innerHTML = cart.items.map(item => {
      const imgUrl = item.featured_image?.url
        ? item.featured_image.url.replace(/(\.\w+)$/, '_80x80$1')
        : null;
      return `
        <div class="pp-cart-line">
          <div class="pp-cart-line-img">
            ${imgUrl
              ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.product_title)}" loading="lazy" width="64" height="64">`
              : '<svg viewBox="0 0 48 48" width="32" height="32" aria-hidden="true"><circle cx="24" cy="24" r="16" fill="#ffd4e0"/><circle cx="24" cy="24" r="11" fill="#ff8fb1"/></svg>'
            }
          </div>
          <div class="pp-cart-line-info">
            <div class="pp-cart-line-name">${escapeHtml(item.product_title)}</div>
            ${item.variant_title && item.variant_title !== 'Default Title'
              ? `<div class="pp-cart-line-meta">${escapeHtml(item.variant_title)}</div>`
              : ''
            }
            <div class="pp-cart-line-meta">Qty ${item.quantity}</div>
          </div>
          <div class="pp-cart-line-price">${formatMoneyRaw(item.final_price * item.quantity)}</div>
        </div>`;
    }).join('');
  }

  function openCart() {
    const drawer  = document.getElementById('pp-cart-drawer');
    const overlay = document.getElementById('pp-cart-overlay');
    drawer?.classList.add('pp-open');
    overlay?.classList.add('pp-open');
    overlay?.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    refreshCartDrawer();
    // Focus the close button for accessibility
    setTimeout(() => document.getElementById('pp-cart-close')?.focus(), 50);
  }

  function closeCart() {
    const drawer  = document.getElementById('pp-cart-drawer');
    const overlay = document.getElementById('pp-cart-overlay');
    drawer?.classList.remove('pp-open');
    overlay?.classList.remove('pp-open');
    overlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleCart() {
    const drawer = document.getElementById('pp-cart-drawer');
    if (drawer?.classList.contains('pp-open')) closeCart();
    else openCart();
  }

  // ——— Mobile menu ———
  function initMobileMenu() {
    const trigger = document.getElementById('pp-mobile-menu-trigger');
    if (!trigger || trigger.dataset.ppBound) return;
    trigger.dataset.ppBound = '1';

    const closeBtn = document.getElementById('pp-mobile-menu-close');
    const overlay  = document.getElementById('pp-mobile-menu-overlay');
    const menu     = document.getElementById('pp-mobile-menu');

    function openMenu() {
      menu?.classList.add('pp-open');
      overlay?.classList.add('pp-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn?.focus(), 50);
    }
    function closeMenu() {
      menu?.classList.remove('pp-open');
      overlay?.classList.remove('pp-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      trigger.focus();
    }

    trigger.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);

    // Close when a link is tapped
    menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu?.classList.contains('pp-open')) closeMenu();
    });
  }

  // ——— Sticky mobile CTA visibility ———
  function initStickyCta() {
    const sticky = document.getElementById('pp-sticky-cta');
    if (!sticky || window._ppStickyBound) return;
    window._ppStickyBound = true;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          sticky.classList.toggle('pp-visible', window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ——— Drag-scroll for TikTok review cards ———
  function initDragScroll() {
    document.querySelectorAll('.pp-tiktok-row:not([data-pp-drag])').forEach(el => {
      el.dataset.ppDrag = '1';
      let isDown = false, startX = 0, scrollLeft = 0;
      el.addEventListener('mousedown', e => {
        isDown = true;
        el.classList.add('pp-dragging');
        startX = e.pageX - el.getBoundingClientRect().left;
        scrollLeft = el.scrollLeft;
        e.preventDefault();
      });
      document.addEventListener('mouseup', () => {
        isDown = false;
        el.classList.remove('pp-dragging');
      });
      el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.getBoundingClientRect().left - startX;
        el.scrollLeft = scrollLeft - x * 1.2;
      });
    });
  }

  // ——— Smooth scrolling for anchor links ———
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([data-pp-scroll])').forEach(a => {
      a.dataset.ppScroll = '1';
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
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
    initMobileMenu();
    initStickyCta();
    initDragScroll();
    initSmoothScroll();

    // Initialise price display from default variant
    const variants = window.ppVariants || [];
    if (variants.length > 0) {
      const defId  = window.ppSelectedVariantId;
      const defVar = variants.find(v => v.id == defId) || variants.find(v => v.available) || variants[0];
      if (defVar) {
        updateAllPriceDisplays(defVar);
        // Sync variant input in case it was empty
        const vi = document.getElementById('pp-variant-id');
        if (vi && (!vi.value || vi.value === '0')) vi.value = defVar.id;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init when Shopify editor loads/reloads a section
  document.addEventListener('shopify:section:load', init);

  // Expose for external use
  window.ppOpenCart  = openCart;
  window.ppCloseCart = closeCart;
  window.ppSyncVariant = syncVariant;

})();
