/**
 * ============================================================
 *  DealPartners — Google Apps Script
 *  Base de datos en Google Sheets (gratuito, sin backend)
 * ============================================================
 *
 *  INSTRUCCIONES DE INSTALACIÓN (10 minutos):
 *
 *  1. Ve a https://sheets.google.com con tu cuenta Gmail
 *  2. Crea una hoja nueva llamada "DealPartners — Leads"
 *  3. En el menú: Extensiones → Apps Script
 *  4. Borra el código que aparece y pega TODO este archivo
 *  5. Guarda (Ctrl+S) con nombre "DealPartners Script"
 *  6. Haz clic en "Implementar" → "Nueva implementación"
 *  7. Tipo: "Aplicación web"
 *     - Ejecutar como: Yo (tu cuenta)
 *     - Quién tiene acceso: Cualquier usuario
 *  8. Haz clic en "Implementar" → Autoriza los permisos
 *  9. Copia la URL que aparece (formato: https://script.google.com/macros/s/XXXXX/exec)
 * 10. Pega esa URL en deal-readiness-score.html y en script.js
 *     donde pone "TU_APPS_SCRIPT_URL"
 *
 * ============================================================
 */

// ── CONFIGURACIÓN ───────────────────────────────────────────
const CONFIG = {
  SHEET_CONTACTO:  'Contactos',      // Pestaña para formulario de contacto
  SHEET_SCORE:     'Deal Score',     // Pestaña para resultados del AI Score
  EMAIL_NOTIF:     'dealpartners.iberia@gmail.com',  // Email que recibirá alertas
  NOTIF_CONTACTO:  true,   // Enviar email al recibir contacto
  NOTIF_SCORE:     true,   // Enviar email al recibir score
};

// ── CABECERAS DE CADA HOJA ──────────────────────────────────
const HEADERS_CONTACTO = [
  'Fecha', 'Nombre', 'Empresa', 'Email', 'Perfil', 'Facturación', 'Mensaje', 'IP aproximada'
];

const HEADERS_SCORE = [
  'Fecha', 'Score Global', 'Nivel',
  'Salud Financiera', 'Independencia Fundador', 'Solidez Operativa', 'Documentación Legal', 'Posición Mercado',
  'EBITDA', 'Crecimiento', 'Recurrencia Ingresos', 'Nivel Deuda',
  'Dependencia Fundador', 'Equipo Directivo', 'Concentración Clientes', 'Permanencia Post-venta',
  'Procesos Documentados', 'Estabilidad Equipo', 'Diferenciación', 'Escalabilidad',
  'Cuentas Auditadas', 'Contingencias', 'Contratos Formalizados', 'Propiedad Intelectual',
  'Posición Competitiva', 'Tendencia Sector', 'Actividad MA Sector', 'Motivación Venta',
  'Rango Valoración Estimado', 'Nombre', 'Email', 'Empresa', 'Teléfono'
];

// ── ENTRADA PRINCIPAL (recibe todas las peticiones) ─────────
function doPost(e) {
  try {
    // no-cors desde el navegador envía text/plain — intentamos parsear igual
    const raw  = e.postData.contents;
    const data = JSON.parse(raw);
    const type = data.type || 'contacto';

    if (type === 'contacto' || type === 'registro-vendedor' || type === 'registro-comprador') {
      return saveContacto(data);
    } else if (type === 'score') {
      return saveScore(data);
    }

    return jsonResponse({ ok: false, error: 'Tipo desconocido: ' + type });
  } catch (err) {
    // Guardar el error en una hoja de debug para diagnóstico
    try {
      const ss    = SpreadsheetApp.getActiveSpreadsheet();
      let dbg     = ss.getSheetByName('_debug');
      if (!dbg) dbg = ss.insertSheet('_debug');
      dbg.appendRow([new Date(), err.message, e.postData ? e.postData.contents : 'sin contenido']);
    } catch(_) {}
    return jsonResponse({ ok: false, error: err.message });
  }
}

// También acepta GET para testing
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'DealPartners API activa ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GUARDAR CONTACTO ────────────────────────────────────────
function saveContacto(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_CONTACTO, HEADERS_CONTACTO);
  const now   = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  sheet.appendRow([
    now,
    data.nombre      || '',
    data.empresa     || '',
    data.email       || '',
    data.perfil      || '',
    data.facturacion || '',
    data.mensaje     || '',
    data.ip          || 'No disponible',
  ]);

  // Colorear fila según perfil
  colorLastRow(sheet, getColorByPerfil(data.perfil));

  // Email de notificación
  if (CONFIG.NOTIF_CONTACTO && data.email) {
    sendNotificationContacto(data, now);
  }

  return jsonResponse({ ok: true, message: 'Contacto guardado' });
}

// ── GUARDAR SCORE ────────────────────────────────────────────
function saveScore(data) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_SCORE, HEADERS_SCORE);
  const now   = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  const score = data.scores || {};
  const ans   = data.answers || {};

  // Texto del nivel
  const nivel = getScoreLevel(data.overall);

  sheet.appendRow([
    now,
    data.overall                    || 0,
    nivel,
    score.financiero?.pct           || 0,
    score.dependencia?.pct          || 0,
    score.operaciones?.pct          || 0,
    score.legal?.pct                || 0,
    score.mercado?.pct              || 0,
    // Respuestas individuales financiero
    ans['financiero_0']             || '',
    ans['financiero_1']             || '',
    ans['financiero_2']             || '',
    ans['financiero_3']             || '',
    // Respuestas dependencia
    ans['dependencia_0']            || '',
    ans['dependencia_1']            || '',
    ans['dependencia_2']            || '',
    ans['dependencia_3']            || '',
    // Respuestas operaciones
    ans['operaciones_0']            || '',
    ans['operaciones_1']            || '',
    ans['operaciones_2']            || '',
    ans['operaciones_3']            || '',
    // Respuestas legal
    ans['legal_0']                  || '',
    ans['legal_1']                  || '',
    ans['legal_2']                  || '',
    ans['legal_3']                  || '',
    // Respuestas mercado
    ans['mercado_0']                || '',
    ans['mercado_1']                || '',
    ans['mercado_2']                || '',
    ans['mercado_3']                || '',
    // Valoración y contacto
    data.valuationRange             || '',
    data.contactNombre              || '',
    data.contactEmail               || '',
    data.contactEmpresa             || '',
    data.contactTelefono            || '',
  ]);

  // Colorear según score
  colorLastRow(sheet, getColorByScore(data.overall));

  // Email notificación si dejó contacto
  if (CONFIG.NOTIF_SCORE && data.contactEmail) {
    sendNotificationScore(data, now, nivel);
  }

  return jsonResponse({ ok: true, message: 'Score guardado' });
}

// ── HELPERS ─────────────────────────────────────────────────
function getOrCreateSheet(name, headers) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Cabecera con estilo
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#1a1814');
    headerRange.setFontColor('#d4af5a');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
    // Autoajustar columnas
    headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  }

  return sheet;
}

function colorLastRow(sheet, color) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
      .setBackground(color);
  }
}

function getColorByPerfil(perfil) {
  const map = {
    'Empresario que quiere vender': '#fff8e8',
    'Inversor o comprador':         '#e8f4fd',
    'Broker o asesor M&A':          '#f0e8f8',
    'Otro':                         '#f5f5f5',
  };
  return map[perfil] || '#ffffff';
}

function getColorByScore(score) {
  if (score >= 75) return '#e8f5e9';  // verde suave
  if (score >= 55) return '#fff8e1';  // amarillo suave
  if (score >= 35) return '#fff3e0';  // naranja suave
  return '#fce4ec';                   // rojo suave
}

function getScoreLevel(score) {
  if (score >= 80) return '🟢 Excelente — Lista para el mercado';
  if (score >= 65) return '🟡 Buena posición — Con ajustes menores';
  if (score >= 45) return '🟠 En desarrollo — Necesita preparación';
  return '🔴 Fase temprana — Preparación necesaria';
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── NOTIFICACIONES EMAIL ─────────────────────────────────────
function sendNotificationContacto(data, timestamp) {
  const subject = `🔔 Nuevo contacto DealPartners — ${data.nombre || 'Sin nombre'} (${data.perfil || 'Sin perfil'})`;
  const body = `
Nueva consulta recibida en DealPartners
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Fecha:       ${timestamp}
👤 Nombre:      ${data.nombre || '—'}
🏢 Empresa:     ${data.empresa || '—'}
📧 Email:       ${data.email || '—'}
👔 Perfil:      ${data.perfil || '—'}
💶 Facturación: ${data.facturacion || '—'}

💬 Mensaje:
${data.mensaje || '(sin mensaje)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ver todos los contactos en Google Sheets →
`.trim();

  MailApp.sendEmail({ to: CONFIG.EMAIL_NOTIF, subject, body });
}

function sendNotificationScore(data, timestamp, nivel) {
  const subject = `📊 Nuevo Deal Score — ${data.overall}/100 (${data.contactNombre || 'Anónimo'})`;
  const scores  = data.scores || {};
  const body = `
Nuevo AI Deal Readiness Score completado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Fecha:          ${timestamp}
🎯 Score Global:   ${data.overall}/100
📈 Nivel:          ${nivel}
💰 Valoración est: EBITDA × ${data.valuationRange || '—'}

📊 Desglose por categoría:
   Salud financiera:        ${scores.financiero?.pct || '—'}/100
   Independencia fundador:  ${scores.dependencia?.pct || '—'}/100
   Solidez operativa:       ${scores.operaciones?.pct || '—'}/100
   Documentación legal:     ${scores.legal?.pct || '—'}/100
   Posición de mercado:     ${scores.mercado?.pct || '—'}/100

👤 Contacto:
   Nombre:   ${data.contactNombre || '—'}
   Email:    ${data.contactEmail || '—'}
   Empresa:  ${data.contactEmpresa || '—'}
   Teléfono: ${data.contactTelefono || '—'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  MailApp.sendEmail({ to: CONFIG.EMAIL_NOTIF, subject, body });
}
