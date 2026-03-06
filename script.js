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

/* ── CONTACT FORM — Formspree async submit ──────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn     = document.getElementById('formSubmitBtn');
    const success = document.getElementById('formSuccess');
    const error   = document.getElementById('formError');

    // Basic validation
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

    // ── Collect form data ─────────────────────────────────────
    const formData = new FormData(contactForm);

    // ── 1. Formspree (email notification) ────────────────────
    let formspreeOk = false;
    try {
      const res = await fetch(contactForm.action, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    formData,
      });
      formspreeOk = res.ok;
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.errors?.map(e => e.message).join(', ') || 'Formspree error');
      }
    } catch (err) {
      console.warn('Formspree error (non-fatal):', err.message);
      // Continue — we still try Google Sheets
    }

    // ── 2. Google Apps Script (database) ─────────────────────
    // Pega aquí tu Apps Script URL cuando lo configures
    const APPS_SCRIPT_URL = 'TU_APPS_SCRIPT_URL';

    if (APPS_SCRIPT_URL !== 'TU_APPS_SCRIPT_URL') {
      try {
        await fetch(APPS_SCRIPT_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            type:        'contacto',
            nombre:      formData.get('nombre'),
            empresa:     formData.get('empresa'),
            email:       formData.get('email'),
            perfil:      formData.get('perfil'),
            facturacion: formData.get('facturacion'),
            mensaje:     formData.get('mensaje'),
          }),
          mode: 'no-cors',
        });
      } catch (err) {
        console.warn('Sheets error (non-fatal):', err.message);
      }
    }

    // ── Show result ───────────────────────────────────────────
    if (formspreeOk || APPS_SCRIPT_URL !== 'TU_APPS_SCRIPT_URL') {
      contactForm.reset();
      btn.style.display     = 'none';
      success.style.display = 'block';
    } else {
      btn.textContent   = 'Solicitar consulta gratuita →';
      btn.disabled      = false;
      btn.style.opacity = '1';
      error.textContent = 'No se pudo enviar. Por favor escríbenos a dealpartners.iberia@gmail.com';
      error.style.display = 'block';
    }
  });
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
