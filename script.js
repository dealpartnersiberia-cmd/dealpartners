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

/* ── MARKETPLACE FILTERS (working) ──────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    // Update active button
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

    // Show/hide empty state
    if (empty) empty.style.display = visible === 0 ? '' : 'none';

    // Re-layout grid: 3 cols when 3+ visible, 1 col for single result
    if (grid) {
      grid.style.gridTemplateColumns = visible === 1
        ? '1fr'
        : 'repeat(3, 1fr)';
    }
  });
});

/* ── CONTACT FORM — Formspree async submit ──────────────── */
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
      error.textContent = 'Por favor completa nombre y email antes de enviar.';
      error.style.display = 'block';
      return;
    }
    error.style.display = 'none';

    btn.textContent   = 'Enviando…';
    btn.disabled      = true;
    btn.style.opacity = '0.7';

    const formData = new FormData(contactForm);

    // 1. Formspree
    let formspreeOk = false;
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: formData,
      });
      formspreeOk = res.ok;
    } catch (err) { console.warn('Formspree:', err.message); }

    // 2. Google Sheets (configure URL in SETUP.md)
    const APPS_SCRIPT_URL = 'TU_APPS_SCRIPT_URL';
    if (APPS_SCRIPT_URL !== 'TU_APPS_SCRIPT_URL') {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contacto',
            nombre:      formData.get('nombre'),
            empresa:     formData.get('empresa'),
            email:       formData.get('email'),
            perfil:      formData.get('perfil'),
            mensaje:     formData.get('mensaje'),
          }),
          mode: 'no-cors',
        });
      } catch (err) { console.warn('Sheets:', err.message); }
    }

    if (formspreeOk || APPS_SCRIPT_URL !== 'TU_APPS_SCRIPT_URL') {
      contactForm.reset();
      btn.style.display     = 'none';
      success.style.display = 'block';
    } else {
      btn.textContent   = 'Enviar consulta →';
      btn.disabled      = false;
      btn.style.opacity = '1';
      error.textContent = 'No se pudo enviar. Por favor inténtalo de nuevo o usa el formulario de registro.';
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

/* ── REGISTRO PAGE: pre-select type from URL param ──────── */
const urlParams = new URLSearchParams(window.location.search);
const tipoParam = urlParams.get('tipo');
if (tipoParam) {
  const selector = document.getElementById('reg-tipo');
  if (selector) selector.value = tipoParam;
  const tab = document.querySelector(`[data-tab="${tipoParam}"]`);
  if (tab) tab.click();
}
