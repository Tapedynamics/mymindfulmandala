# Guida Configurazione Pagamenti - My Mindful Mandala

## 🎯 Panoramica

Il carrello è ora configurato con **2 metodi di pagamento**:
- **Stripe** (Carte di credito/debito)
- **PayPal** (Account PayPal e carte)

---

## 💳 1. Configurazione STRIPE

### Step 1: Crea Account Stripe
1. Vai su [stripe.com](https://stripe.com)
2. Clicca "Sign Up"
3. Completa la registrazione

### Step 2: Ottieni API Keys
1. Accedi alla Dashboard Stripe
2. Vai su **Developers → API keys**
3. Copia la **Publishable key** (inizia con `pk_test_...`)

### Step 3: Configura nel Sito
Apri `assets/js/main.js` e cerca questa riga (circa linea 135):

```javascript
const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
```

Sostituisci `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY` con la tua chiave:

```javascript
const stripe = Stripe('pk_test_51A1B2C3D4E5...');
```

### Step 4: Configura Backend (Richiesto)
Stripe richiede un backend per creare le sessioni di checkout.

**Opzioni:**
- **Netlify Functions** (Serverless)
- **Vercel Functions** (Serverless)
- **Node.js Backend**

**Esempio Backend (Node.js):**
```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: req.body.items,
    mode: 'payment',
    success_url: 'https://yoursite.com/success',
    cancel_url: 'https://yoursite.com/shop',
  });
  res.json({ id: session.id });
});
```

---

## 💰 2. Configurazione PAYPAL

### Step 1: Crea Account Business PayPal
1. Vai su [paypal.com](https://www.paypal.com/bizsignup)
2. Seleziona "Business Account"
3. Completa la registrazione

### Step 2: Ottieni Client ID
1. Vai su [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Clicca su **My Apps & Credentials**
3. In Sandbox/Live, clicca **Create App**
4. Copia il **Client ID**

### Step 3: Configura nel Sito
Apri `it/shop.html` e `en/shop.html` e cerca questa riga (circa linea 494):

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR"></script>
```

Sostituisci `YOUR_PAYPAL_CLIENT_ID` con il tuo Client ID:

```html
<script src="https://www.paypal.com/sdk/js?client-id=AaBbCcDd12345xyz&currency=EUR"></script>
```

### Step 4: Attiva PayPal JavaScript
Il codice PayPal è già configurato in `assets/js/main.js`.

Per renderizzare il pulsante PayPal, decommenta e modifica la funzione `handlePayPalPayment()`:

```javascript
function handlePayPalPayment() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Pagamento completato da ' + details.payer.name.given_name);
                cart = [];
                updateCart();
                closeCartSidebar();
            });
        }
    }).render('#paypalBtn');
}
```

---

## 🧪 3. Modalità TEST

### Stripe Test Mode
- Usa le chiavi con prefisso `pk_test_` e `sk_test_`
- Carte di test: `4242 4242 4242 4242` (Visa)
- Scadenza: qualsiasi data futura
- CVV: qualsiasi 3 cifre

### PayPal Sandbox
- Usa il **Sandbox Client ID** dal Developer Dashboard
- Crea account test da PayPal Sandbox
- Testa pagamenti senza soldi reali

---

## ✅ 4. Modalità LIVE (Produzione)

### Stripe Live
1. Completa la verifica account Stripe
2. Ottieni le chiavi **Live** (`pk_live_...`)
3. Sostituisci le chiavi test con quelle live

### PayPal Live
1. Completa la verifica Business Account
2. Usa il **Live Client ID**
3. Sostituisci nel codice

---

## 🎨 5. Personalizzazioni

### Cambiare Valuta
Modifica `currency=EUR` in:
- `currency=USD` per Dollari
- `currency=GBP` per Sterline

### Aggiungere Email Conferma
Integra un servizio email:
- SendGrid
- Mailgun
- AWS SES

### Analytics
Aggiungi eventi Google Analytics:
```javascript
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: total,
  currency: 'EUR'
});
```

---

## 📞 Supporto

**Stripe:** [stripe.com/support](https://support.stripe.com)
**PayPal:** [developer.paypal.com/support](https://developer.paypal.com/support)

---

## 🔒 Sicurezza

✅ **Già implementato:**
- HTTPS required (Stripe/PayPal requirement)
- PCI Compliance (handled by Stripe/PayPal)
- Tokenizzazione carte (no card data stored)

✅ **Da aggiungere (opzionale):**
- Rate limiting per prevenire abusi
- CAPTCHA per checkout
- Email verification

---

**Ultima modifica:** 2025-11-09
**Versione:** 1.0
