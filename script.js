/* ============================================================
   DealPartners — Main JavaScript
   ============================================================ */

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzqpEq9MxZ897RSBmpP7jTAM6x3LprSNFdr94FDmyMXtFwUzEqaqz7tj-CISIQqjOR4/exec';

/* ── NAVBAR ─────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── SCROLL REVEAL ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── MARKETPLACE FILTERS ─────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    const cards  = document.querySelectorAll('.listing-card');
    const grid   = document.getElementById('listingsGrid');
    const empty  = document.getElementById('listingEmpty');
    let visible  = 0;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.sector === filter;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (empty) empty.style.display = visible === 0 ? '' : 'none';
    if (grid)  grid.style.gridTemplateColumns = visible === 1 ? '1fr' : 'repeat(3, 1fr)';
  });
});

/* ── CONTACT FORM ────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn     = document.getElementById('formSubmitBtn');
    const success = document.getElementById('formSuccess');
    const error   = document.getElementById('formError');

    const nombre = contactForm.querySelector('[name="nombre"]').value.trim();
    const email  = contactForm.querySelector('[name="email"]').value.trim();

    if (!nombre || !email) {
      error.textContent   = 'Por favor completa nombre y email antes de enviar.';
      error.style.display = 'block';
      return;
    }
    error.style.display = 'none';
    btn.textContent     = 'Enviando…';
    btn.disabled        = true;
    btn.style.opacity   = '0.7';

    const formData = new FormData(contactForm);

    // 1. Formspree — email inmediato a dealpartners.iberia@gmail.com
    let ok = false;
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      ok = res.ok;
    } catch (err) {
      console.warn('Formspree error:', err.message);
    }

    // 2. Google Sheets — base de datos
    try {
      const payload = JSON.stringify({
        type:    'contacto',
        nombre:  formData.get('nombre'),
        empresa: formData.get('empresa') || '',
        email:   formData.get('email'),
        perfil:  formData.get('perfil') || '',
        mensaje: formData.get('mensaje') || '',
      });
      // Enviamos como text/plain para evitar preflight CORS con Apps Script
      await fetch(SHEETS_URL, {
        method: 'POST',
        body:   payload,
        mode:   'no-cors',
      });
    } catch (err) {
      console.warn('Sheets error:', err.message);
    }

    if (ok) {
      contactForm.reset();
      btn.style.display     = 'none';
      success.style.display = 'block';
    } else {
      btn.textContent     = 'Enviar consulta →';
      btn.disabled        = false;
      btn.style.opacity   = '1';
      error.textContent   = 'No se pudo enviar. Por favor inténtalo de nuevo en unos segundos.';
      error.style.display = 'block';
    }
  });
}

/* ── AI SCORE WIDGET: animate bars on scroll ────────────── */
const scoreObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.score-meter-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, 300);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.score-widget').forEach(el => scoreObserver.observe(el));

/* ── REGISTRO PAGE: pre-select tab from URL param ───────── */
const urlParams = new URLSearchParams(window.location.search);
const tipoParam = urlParams.get('tipo');
if (tipoParam) {
  const tab = document.querySelector('[data-tab="' + tipoParam + '"]');
  if (tab) tab.click();
}
