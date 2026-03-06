# DealPartners — Guía de configuración
## Formularios y base de datos (30 minutos, todo gratuito)

---

## PARTE 1 — Formulario de contacto (Formspree)
*Tiempo: 5 minutos*

El formulario de contacto de la landing page usa **Formspree**, que envía los datos
directamente a tu email sin necesitar ningún servidor propio.

### Pasos:

1. Ve a **https://formspree.io** y crea una cuenta con `dealpartners.iberia@gmail.com`

2. En el dashboard, haz clic en **"+ New Form"**
   - Name: "DealPartners Contacto"
   - Email: dealpartners.iberia@gmail.com

3. Copia el **Form ID** que aparece (formato: `xyzabcde`)

4. Abre `index.html` y busca esta línea:
   ```html
   action="https://formspree.io/f/TU_FORM_ID"
   ```
   Reemplaza `TU_FORM_ID` por tu ID real. Ejemplo:
   ```html
   action="https://formspree.io/f/xyzabcde"
   ```

5. En Formspree, ve a Settings del form → Email notifications:
   - Confirma el email de destino: dealpartners.iberia@gmail.com

✅ Listo. Cada vez que alguien envíe el formulario recibirás un email.

---

## PARTE 2 — Base de datos Google Sheets (Apps Script)
*Tiempo: 15 minutos*

Todos los datos del formulario de contacto Y del AI Deal Readiness Score
se guardan automáticamente en una hoja de Google Sheets.
Recibirás también un email de alerta por cada envío.

### Pasos:

#### 2.1 Crear la hoja de cálculo
1. Ve a **https://sheets.google.com** (con tu cuenta Gmail)
2. Crea una hoja nueva → nómbrala: **"DealPartners — Leads"**
3. Guárdala (se crea automáticamente en Google Drive)

#### 2.2 Instalar el script
1. En la hoja, ve al menú: **Extensiones → Apps Script**
2. Se abre el editor. Borra TODO el código que aparece por defecto
3. Abre el archivo `database/google-apps-script.js` de este proyecto
4. Copia TODO su contenido y pégalo en el editor de Apps Script
5. Haz clic en el icono de guardar 💾 (o Ctrl+S)
   - Nombre del proyecto: "DealPartners Script"

#### 2.3 Implementar como API web
1. Haz clic en el botón azul **"Implementar"** → **"Nueva implementación"**
2. Haz clic en el icono ⚙️ junto a "Tipo" → selecciona **"Aplicación web"**
3. Configura:
   - **Descripción:** DealPartners API v1
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier usuario
4. Haz clic en **"Implementar"**
5. Si pide autorización → haz clic en "Autorizar acceso":
   - Selecciona tu cuenta Gmail
   - Haz clic en "Opciones avanzadas" → "Ir a DealPartners Script (no seguro)"
   - Haz clic en "Permitir"
6. **Copia la URL** que aparece. Tiene este formato:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

#### 2.4 Conectar la URL al proyecto web
Abre **dos archivos** y reemplaza `TU_APPS_SCRIPT_URL` por la URL copiada:

**En `script.js`** (línea ~45):
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL/exec';
```

**En `deal-readiness-score.html`** (busca `TU_APPS_SCRIPT_URL`):
```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_URL/exec';
```

✅ Listo. Desde ahora:
- Cada contacto del formulario → nueva fila en pestaña "Contactos" + email de alerta
- Cada Score completado → nueva fila en pestaña "Deal Score" + email de alerta

---

## PARTE 3 — Verificar que todo funciona
*Tiempo: 5 minutos*

### Test formulario de contacto:
1. Abre tu web y rellena el formulario con datos de prueba
2. Comprueba que recibes email en dealpartners.iberia@gmail.com
3. Comprueba que aparece la fila en Google Sheets (pestaña "Contactos")

### Test AI Deal Readiness Score:
1. Ve a `deal-readiness-score.html`
2. Completa las 20 preguntas
3. En los resultados, introduce nombre y email de prueba
4. Comprueba que recibes email y aparece en Sheets (pestaña "Deal Score")

### Si algo falla:
- En Apps Script: Ve a **Ejecuciones** (icono ▶ en el menú izquierdo) para ver errores
- Asegúrate de que la implementación sea "Cualquier usuario" (no solo usuarios de Google)
- Si cambias el código del script, debes crear una **nueva implementación** (no actualizar la existente)

---

## ESTRUCTURA DE LA BASE DE DATOS

### Pestaña "Contactos"
| Columna | Contenido |
|---------|-----------|
| Fecha | Timestamp exacto |
| Nombre | Nombre del contacto |
| Empresa | Nombre de la empresa |
| Email | Email de contacto |
| Perfil | Vendedor / Comprador / Broker / Otro |
| Facturación | Rango de facturación |
| Mensaje | Texto libre del formulario |
| IP aproximada | IP del visitante (cuando disponible) |

*Código de colores: amarillo=vendedor, azul=comprador, morado=broker*

### Pestaña "Deal Score"
| Columnas | Contenido |
|----------|-----------|
| Fecha, Score Global, Nivel | Resultado principal |
| Salud Financiera … Posición Mercado | Score por categoría (0-100) |
| EBITDA … Motivación Venta | Respuesta a cada pregunta |
| Rango Valoración Estimado | Múltiplo EBITDA sugerido |
| Nombre, Email, Empresa, Teléfono | Datos de contacto (si los dejó) |

*Código de colores: verde=score alto, amarillo=medio, naranja=bajo, rojo=crítico*

---

## COSTES

| Servicio | Plan | Coste |
|----------|------|-------|
| Formspree | Free (50 envíos/mes) | 0€ |
| Formspree | Basic (250 envíos/mes) | ~8€/mes |
| Google Sheets + Apps Script | Gratuito | 0€ |
| Netlify (hosting web) | Free (100GB/mes) | 0€ |

Para empezar, el plan gratuito de Formspree es más que suficiente.
Cuando superes los 50 contactos al mes, es buena señal — actualiza al plan Basic.
