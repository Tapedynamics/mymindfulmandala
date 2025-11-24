# Guida Configurazione Netlify per Stripe

Questa guida ti aiuterà a configurare Netlify per abilitare i pagamenti Stripe automatici sul sito My Mindful Mandala.

## 📋 Prerequisiti

- Account Netlify (gratuito): https://app.netlify.com
- Repository GitHub già collegato a Netlify
- Chiave segreta Stripe (sk_live_...)

---

## 🚀 Passo 1: Deploy su Netlify

Se non l'hai ancora fatto:

1. Vai su https://app.netlify.com
2. Clicca "Add new site" → "Import an existing project"
3. Connetti il tuo repository GitHub: `Tapedynamics/mymindfulmandala`
4. Configura il build:
   - **Build command:** lascia vuoto (sito statico)
   - **Publish directory:** `.` (root)
5. Clicca "Deploy site"

---

## 🔑 Passo 2: Configurare le Variabili d'Ambiente

Questo è il passo **FONDAMENTALE** per far funzionare Stripe:

### Dove trovare la chiave segreta Stripe:

1. Vai su https://dashboard.stripe.com
2. Fai login con il tuo account Stripe
3. Clicca su "Developers" nel menu in alto
4. Clicca su "API keys" nel menu laterale
5. Nella sezione "Secret key", clicca "Reveal test key" o "Reveal live key"
6. **COPIA** la chiave segreta (inizia con `sk_live_...` per modalità live)

### Configurare su Netlify:

1. Nel tuo sito Netlify, vai su **Site settings**
2. Nel menu laterale, clicca **Environment variables**
3. Clicca **Add a variable**
4. Aggiungi:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_live_...` (la tua chiave segreta copiata da Stripe)
   - **Scopes:** seleziona "All" o "Production"
5. Clicca **Create variable**

⚠️ **IMPORTANTE**: NON condividere mai la chiave segreta pubblicamente!

---

## 🔧 Passo 3: Installare Dipendenze

Netlify installerà automaticamente le dipendenze Node.js quando farà il deploy.

Il file `package.json` include:
- `stripe`: SDK Stripe per Node.js

Netlify lo installerà automaticamente durante il build delle Functions.

---

## ✅ Passo 4: Verificare il Deploy

1. Aspetta che il deploy sia completo (circa 1-2 minuti)
2. Vai su **Functions** nel menu del tuo sito Netlify
3. Dovresti vedere: `create-checkout-session`
4. Clicca sulla function per vedere i log

---

## 🧪 Passo 5: Testare Stripe

1. Vai sul tuo sito live: `https://tuo-sito.netlify.app`
2. Aggiungi un prodotto al carrello
3. Clicca "Paga con Stripe"
4. Dovresti essere reindirizzato alla pagina di checkout Stripe

### Carte di test Stripe:

Per testare senza pagamenti reali (se usi chiavi test):

- **Successo:** 4242 4242 4242 4242
- **Data scadenza:** qualsiasi data futura (es. 12/34)
- **CVC:** qualsiasi 3 cifre (es. 123)
- **CAP:** qualsiasi 5 cifre

---

## 🔍 Troubleshooting

### Errore: "Failed to create checkout session"

**Causa:** Variabile d'ambiente non configurata

**Soluzione:**
1. Vai su Site settings → Environment variables
2. Verifica che `STRIPE_SECRET_KEY` sia presente
3. Verifica che la chiave inizi con `sk_live_` o `sk_test_`
4. Dopo aver modificato le variabili, fai un **nuovo deploy**:
   - Vai su Deploys → Trigger deploy → Deploy site

### Errore: "Function not found"

**Causa:** Netlify non ha trovato le functions

**Soluzione:**
1. Verifica che il file `netlify.toml` sia nella root del progetto
2. Verifica che la cartella `netlify/functions/` esista
3. Fai un nuovo commit e push su GitHub

### Il pagamento non funziona

**Soluzione:**
1. Apri la Console del browser (F12)
2. Guarda la tab "Network" mentre clicchi "Paga con Stripe"
3. Cerca errori nella chiamata a `/.netlify/functions/create-checkout-session`
4. Controlla i log delle Functions su Netlify:
   - Site → Functions → create-checkout-session → Function log

---

## 📊 Monitorare i Pagamenti

### Su Stripe:
1. Vai su https://dashboard.stripe.com
2. Clicca su "Payments" per vedere tutti i pagamenti
3. Ogni pagamento mostra:
   - Importo
   - Cliente
   - Stato (succeeded, failed, etc.)
   - Prodotti acquistati (nei metadata)

### Su Netlify:
1. Vai su Functions → create-checkout-session
2. Clicca su "Function log" per vedere le chiamate

---

## 🎯 URL Importanti

- **Dashboard Stripe:** https://dashboard.stripe.com
- **Netlify Dashboard:** https://app.netlify.com
- **Documentazione Stripe:** https://stripe.com/docs
- **Documentazione Netlify Functions:** https://docs.netlify.com/functions/overview/

---

## 🔒 Sicurezza

✅ La chiave segreta è su Netlify (sicura)
✅ La chiave pubblica è nel codice (ok, è pubblica)
✅ .gitignore protegge i file sensibili
✅ Le transazioni avvengono sui server Stripe (sicure)

❌ NON mettere mai `sk_live_...` nel codice JavaScript
❌ NON committare file con chiavi segrete su GitHub
❌ NON condividere screenshot del Dashboard Stripe

---

## 📈 Prossimi Passi (Opzionali)

1. **Webhook Stripe**: Ricevi notifiche quando un pagamento è completato
2. **Email automatiche**: Invia conferme ordine via email
3. **Gestione inventario**: Aggiorna stock dopo ogni vendita
4. **Analytics**: Traccia conversioni con Google Analytics

---

## ❓ Domande Frequenti

**Q: Posso testare senza pagare veramente?**
A: Sì! Usa le chiavi test di Stripe (`pk_test_...` e `sk_test_...`) e le carte di test.

**Q: Quanto costa Netlify?**
A: Il piano gratuito include 125k invocazioni/mese di Functions. Più che sufficiente per iniziare!

**Q: Stripe prende commissioni?**
A: Sì, 1.4% + €0.25 per transazione in Europa con carte europee.

**Q: Posso usare questo setup in produzione?**
A: Sì! Cambia solo le chiavi test con le chiavi live.

---

## 📞 Supporto

- **Stripe Support:** https://support.stripe.com
- **Netlify Support:** https://answers.netlify.com
- **Problemi tecnici:** Apri un issue su GitHub

---

**Fatto! Ora Stripe è completamente configurato e funzionante! 🎉**
