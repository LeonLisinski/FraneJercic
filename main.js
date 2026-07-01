/* ═══════════════════════════════════════════════════════════
   TAJNE ONLINE TRENERSTVA — Frane Jerčić
   main.js
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Adaptive favicon ────────────────────────────────────
  const faviconEl = document.getElementById('favicon');
  if (faviconEl) {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const setFavicon = (dark) => {
      faviconEl.href = dark
        ? 'assets/favicon-dark.png'
        : 'assets/favicon-light.png';
    };
    setFavicon(darkMq.matches);
    darkMq.addEventListener('change', e => setFavicon(e.matches));
  }

  // ─── FAQ accordion ───────────────────────────────────────
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const ans    = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── Stats: count-up animacija ───────────────────────────
  function countUp(el, target, suffix, duration) {
    const startTime = performance.now();
    const easeOut   = t => 1 - (1 - t) ** 3;
    function frame(now) {
      const t = Math.min((now - startTime) / duration, 1);
      el.textContent = Math.round(easeOut(t) * target) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      document.querySelectorAll('.stat[data-count]:not([aria-hidden])').forEach(stat => {
        countUp(
          stat.querySelector('.num'),
          parseInt(stat.dataset.count),
          stat.dataset.suffix || '',
          1800
        );
      });
      io.disconnect();
    }, { threshold: 0.45 });
    io.observe(statsSection);
  }

  // ─── Stats: mobile infinite marquee ─────────────────────
  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid) {
    const mq = window.matchMedia('(max-width: 540px)');

    function initMarquee(m) {
      statsGrid.querySelectorAll('.stat[aria-hidden]').forEach(el => el.remove());
      if (!m.matches) return;
      [...statsGrid.querySelectorAll('.stat:not([aria-hidden])')].forEach(stat => {
        const clone = stat.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        statsGrid.appendChild(clone);
      });
    }

    mq.addEventListener('change', initMarquee);
    initMarquee(mq);
  }

  // ─── Testimonials slider ─────────────────────────────────
  const tTrack   = document.getElementById('tSlider');
  const tPrev    = document.getElementById('tPrev');
  const tNext    = document.getElementById('tNext');
  const tCounter = document.getElementById('tCounter');

  if (tTrack && tPrev && tNext) {
    let tPage = 0;

    function tCardWidth() {
      const card = tTrack.querySelector('.tcard');
      if (!card) return tTrack.offsetWidth;
      return card.offsetWidth + 20;
    }

    function tVisibleCount() {
      return Math.max(1, Math.round(tTrack.offsetWidth / tCardWidth()));
    }

    function tTotalPages() {
      return Math.ceil(tTrack.querySelectorAll('.tcard').length / tVisibleCount());
    }

    function goToPage(p) {
      const total = tTotalPages();
      tPage = ((p % total) + total) % total;
      tTrack.scrollTo({ left: tPage * tCardWidth() * tVisibleCount(), behavior: 'smooth' });
      if (tCounter) tCounter.textContent = (tPage + 1) + ' / ' + total;
    }

    tPrev.addEventListener('click', () => goToPage(tPage - 1));
    tNext.addEventListener('click', () => goToPage(tPage + 1));

    tTrack.addEventListener('scroll', () => {
      if (tCounter) {
        const p = Math.round(tTrack.scrollLeft / (tCardWidth() * tVisibleCount()));
        tCounter.textContent = (p + 1) + ' / ' + tTotalPages();
        tPage = p;
      }
    }, { passive: true });

    window.addEventListener('resize', () => goToPage(tPage), { passive: true });
    goToPage(0);
  }

  // ─── Sticky CTA ──────────────────────────────────────────
  const sticky    = document.getElementById('stickyCta');
  const hero      = document.querySelector('.hero');
  const footerCta = document.querySelector('.cta-block');

  function updateSticky() {
    const heroBottom   = hero.getBoundingClientRect().bottom;
    const ctaTop       = footerCta ? footerCta.getBoundingClientRect().top : Infinity;
    const windowH      = window.innerHeight;
    const stickyH      = sticky.offsetHeight;

    if (heroBottom < 0 && ctaTop > windowH) {
      sticky.classList.add('show');
      document.body.style.paddingBottom = stickyH + 'px';
    } else {
      sticky.classList.remove('show');
      document.body.style.paddingBottom = '';
    }
  }

  window.addEventListener('scroll', updateSticky, { passive: true });
  updateSticky();

});

/* ─── THEME PICKER ─── */
(function () {
  const root    = document.documentElement;
  const picker  = document.getElementById('themePicker');
  const toggle  = document.getElementById('tpToggle');
  const panel   = document.getElementById('tpPanel');

  if (!picker) return;

  const COLORS = {
    '#e8341c': '232,52,28',
    '#2563eb': '37,99,235',
    '#16a34a': '22,163,74',
    '#d97706': '217,119,6',
    '#9333ea': '147,51,234',
    '#0891b2': '8,145,178',
    '#db2777': '219,39,119',
  };

  function setAccent(hex) {
    root.style.setProperty('--red', hex);
    root.style.setProperty('--accent-rgb', COLORS[hex] || '232,52,28');
    panel.querySelectorAll('.tp-swatch').forEach(s =>
      s.classList.toggle('active', s.dataset.color === hex)
    );
    localStorage.setItem('tp-color', hex);
  }

  function setMode(mode) {
    root.setAttribute('data-theme', mode);
    panel.querySelectorAll('.tp-mode').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === mode)
    );
    localStorage.setItem('tp-mode', mode);
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () =>
    panel.hidden ? openPanel() : closePanel()
  );

  document.addEventListener('click', e => {
    if (!picker.contains(e.target)) closePanel();
  });

  panel.querySelectorAll('.tp-swatch').forEach(s =>
    s.addEventListener('click', () => setAccent(s.dataset.color))
  );

  panel.querySelectorAll('.tp-mode').forEach(b =>
    b.addEventListener('click', () => setMode(b.dataset.mode))
  );

  const savedColor = localStorage.getItem('tp-color') || '#e8341c';
  const savedMode  = localStorage.getItem('tp-mode')  || 'dark';
  setAccent(savedColor);
  setMode(savedMode);
}());
