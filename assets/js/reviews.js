/* Form recensioni: voto 1-5 + giudizio breve.
   La recensione NON va online subito: arriva a Terry, che la approva dalla dashboard. */
(function () {
  var API = 'https://dashmandala.duckdns.org/api';
  var lang = (document.documentElement.lang || 'it').toLowerCase().indexOf('en') === 0 ? 'en' : 'it';

  var T = {
    it: {
      invalid: 'Scegli un voto, scrivi il tuo nome e il tuo giudizio.',
      sending: 'Invio in corso...',
      ok: 'Grazie di cuore! La tua recensione è stata inviata: sarà pubblicata dopo che Terry l\'avrà letta.',
      tooMany: 'Hai inviato una recensione da poco. Riprova più tardi.',
      error: 'Non è stato possibile inviare la recensione. Riprova più tardi.',
      send: 'Invia recensione'
    },
    en: {
      invalid: 'Please choose a rating, and write your name and your review.',
      sending: 'Sending...',
      ok: 'Thank you so much! Your review has been sent: it will be published once Terry has read it.',
      tooMany: 'You sent a review recently. Please try again later.',
      error: 'We could not send your review. Please try again later.',
      send: 'Send review'
    }
  }[lang];

  var toggle = document.getElementById('reviewToggle');
  var form = document.getElementById('reviewForm');
  if (!toggle || !form) return;

  var starsBox = document.getElementById('reviewStars');
  var msg = document.getElementById('reviewMsg');
  var submitBtn = document.getElementById('reviewSubmit');
  var rating = 0;

  toggle.addEventListener('click', function () {
    var opening = form.classList.contains('hidden');
    form.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(opening));
    if (opening) form.querySelector('input, textarea').focus();
  });

  // stelle
  var stars = [].slice.call(starsBox.querySelectorAll('.star'));
  function paint(v) {
    stars.forEach(function (s) {
      s.classList.toggle('on', Number(s.dataset.v) <= v);
    });
  }
  stars.forEach(function (s) {
    s.addEventListener('click', function () {
      rating = Number(s.dataset.v);
      paint(rating);
      starsBox.setAttribute('aria-label', rating + '/5');
    });
    s.addEventListener('mouseenter', function () { paint(Number(s.dataset.v)); });
  });
  starsBox.addEventListener('mouseleave', function () { paint(rating); });

  function say(text, kind) {
    msg.textContent = text;
    msg.className = 'review-msg' + (kind ? ' ' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('reviewName').value.trim();
    var body = document.getElementById('reviewBody').value.trim();
    var website = document.getElementById('reviewWebsite').value; // honeypot

    if (!rating || !name || !body) return say(T.invalid, 'err');

    submitBtn.disabled = true;
    say(T.sending);

    fetch(API + '/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ author_name: name, rating: rating, body: body, lang: lang, website: website })
    })
      .then(function (r) {
        if (r.status === 429) throw new Error('tooMany');
        if (!r.ok) throw new Error('error');
        return r.json();
      })
      .then(function () {
        form.reset();
        rating = 0; paint(0);
        say(T.ok, 'ok');
        // niente doppio invio: il form si chiude dopo il grazie
        setTimeout(function () { form.classList.add('hidden'); say(''); }, 6000);
      })
      .catch(function (err) {
        say(err.message === 'tooMany' ? T.tooMany : T.error, 'err');
      })
      .finally(function () { submitBtn.disabled = false; });
  });
})();
