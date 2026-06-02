# Variables de entorno pendientes — ConectAr Talento

> Agregar en **Vercel Dashboard → Settings → Environment Variables**  
> Seleccionar los 3 entornos: Production, Preview, Development

---

## ✅ Listas para cargar ahora

### Sentry (monitoreo de errores)
| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://b1afb492df79fc36a0218a9307abfbe7@o4511493471928320.ingest.us.sentry.io/4511493496176640` |

---

## ⏳ Requieren crear cuenta primero

### Google Analytics 4
> Crear propiedad en [analytics.google.com](https://analytics.google.com) → Admin → Flujos de datos → sitio web → copiar Measurement ID

| Variable | Formato |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |

---

### Crisp Chat (soporte en vivo)
> Crear cuenta en [crisp.chat](https://crisp.chat) → Settings → Website → Website ID

| Variable | Formato |
|---|---|
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

---

### Resend (emails transaccionales)
> Crear cuenta en [resend.com](https://resend.com) → API Keys → Create Key  
> Verificar dominio en Resend para usar un from personalizado

| Variable | Ejemplo |
|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | `ConectAr Talento <no-reply@conectartalento.com>` |

---

### Stripe (pagos y suscripciones)
> Crear cuenta en [stripe.com](https://stripe.com)  
> Developers → API Keys para las claves  
> Products → crear 3 productos (Starter $29, Pro $79, Business $149) → copiar Price IDs  
> Developers → Webhooks → Add endpoint → URL: `https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app/api/stripe/webhook`  
> Eventos a escuchar: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

| Variable | Descripción |
|---|---|
| `STRIPE_SECRET_KEY` | Clave secreta (`sk_live_...` en prod, `sk_test_...` en dev) |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook (`whsec_...`) |
| `STRIPE_PRICE_STARTER` | Price ID del plan Starter (`price_...`) |
| `STRIPE_PRICE_PRO` | Price ID del plan Pro (`price_...`) |
| `STRIPE_PRICE_BUSINESS` | Price ID del plan Business (`price_...`) |

---

## 📋 Checklist

- [ ] `NEXT_PUBLIC_SENTRY_DSN` — valor ya disponible, cargar ahora
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` — crear propiedad GA4
- [ ] `NEXT_PUBLIC_CRISP_WEBSITE_ID` — crear cuenta Crisp
- [ ] `RESEND_API_KEY` — crear cuenta Resend
- [ ] `RESEND_FROM_EMAIL` — verificar dominio en Resend
- [ ] `STRIPE_SECRET_KEY` — crear cuenta Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` — configurar webhook en Stripe
- [ ] `STRIPE_PRICE_STARTER` — crear producto en Stripe
- [ ] `STRIPE_PRICE_PRO` — crear producto en Stripe
- [ ] `STRIPE_PRICE_BUSINESS` — crear producto en Stripe
