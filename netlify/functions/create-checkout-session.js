const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/* PREZZI AUTORITATIVI.
   Il browser manda id/nome/prezzo, ma nome e prezzo NON sono affidabili: chiunque
   puo' modificarli dagli strumenti di sviluppo e pagare quanto vuole. Qui usiamo
   SOLO l'id per cercare il prezzo vero in products.json, che viene generato dalla
   dashboard di Terry e committato insieme al sito (stesso deploy = sempre coerente).
   Nessuna dipendenza da server esterni: se td-04 e' giu', il checkout funziona lo stesso. */
let BUNDLED = null;
try {
  BUNDLED = require('../../products.json');
} catch (e) {
  console.warn('products.json non incluso nel bundle, si usera\' il fetch:', e.message);
}

async function loadPrices(siteUrl) {
  if (BUNDLED) return BUNDLED;
  const r = await fetch(`${siteUrl}/products.json`);
  if (!r.ok) throw new Error(`products.json non raggiungibile (${r.status})`);
  return r.json();
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const items = Array.isArray(body.items) ? body.items : [];
    const lang = body.lang === 'en' ? 'en' : 'it';

    if (!items.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items in cart' }) };
    }

    const siteUrl = process.env.URL || 'https://mymindfulmandala.org';
    const prices = await loadPrices(siteUrl);
    const byId = new Map(prices.map((p) => [Number(p.id), p]));

    const lineItems = [];
    for (const item of items) {
      const p = byId.get(Number(item.id));
      // id sconosciuto = prodotto venduto/rimosso mentre era nel carrello, oppure manomesso
      if (!p) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'unavailable_item',
            message: lang === 'en'
              ? 'One of the items is no longer available. Please refresh the page.'
              : 'Uno dei pezzi non è più disponibile. Ricarica la pagina.',
          }),
        };
      }
      const quantity = Math.max(1, Math.min(20, parseInt(item.quantity, 10) || 1));
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: lang === 'en' ? p.name_en : p.name_it,
            description: lang === 'en' ? 'Hand-painted mandala' : 'Mandala dipinto a mano',
          },
          unit_amount: Math.round(Number(p.price) * 100), // <- prezzo dal listino, non dal client
        },
        quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${lang}/${lang === 'en' ? 'shop' : 'shop'}.html`,
      shipping_address_collection: {
        allowed_countries: ['IT', 'US', 'GB', 'DE', 'FR', 'ES', 'NL', 'BE', 'AT', 'CH'],
      },
      locale: lang,
      metadata: {
        items: JSON.stringify(lineItems.map((l) => `${l.price_data.product_data.name} (x${l.quantity})`)),
      },
    });

    return { statusCode: 200, headers, body: JSON.stringify({ sessionId: session.id, url: session.url }) };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session', details: error.message }),
    };
  }
};
