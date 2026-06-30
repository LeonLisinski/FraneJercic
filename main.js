/* ═══════════════════════════════════════════════════════════
   TAJNE ONLINE TRENERSTVA — Frane Jerčić
   main.js
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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
  const footerCta = document.querySelector('.footer-cta');

  function updateSticky() {
    const heroBottom   = hero.getBoundingClientRect().bottom;
    const footerTop    = footerCta ? footerCta.getBoundingClientRect().top : Infinity;
    const windowH      = window.innerHeight;
    const stickyH      = sticky.offsetHeight;

    if (heroBottom < 0 && footerTop > windowH) {
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
