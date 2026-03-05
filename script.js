/* ============================================================
   DealPartners — Main JavaScript
   ============================================================ */

/* ── NAVBAR: scroll shadow ──────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 40);
});

/* ── SCROLL REVEAL ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── FILTER BUTTONS ─────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── CONTACT FORM SUBMIT ────────────────────────────────── */
function handleSubmit(btn) {
  btn.textContent = '✓ Recibido — Te contactamos en 24h';
  btn.style.background = '#4a7c59';
  btn.disabled = true;
}

/* ── AI SCORE WIDGET: animate bars on scroll ────────────── */
const scoreObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.score-meter-fill').forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = targetWidth; }, 300);
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.score-widget').forEach(el => scoreObserver.observe(el));
