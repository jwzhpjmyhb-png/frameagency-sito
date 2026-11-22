/* FRAME Agency — comportamento del sito (nessun cookie, nessun tracciamento) */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // intestazione che si scurisce scorrendo
  var hdr = d.querySelector('.hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('on', window.scrollY > 20); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // menu mobile: quando è aperto la pagina sotto resta ferma (anche su iPhone)
  var burger = d.querySelector('.burger'), sy = 0;
  function menu(open) {
    if (open === d.body.classList.contains('menu-open')) return;
    if (open) {
      sy = window.scrollY;
      d.body.style.top = -sy + 'px';
      d.body.classList.add('menu-open', 'menu-lock');
    } else {
      d.body.classList.remove('menu-open', 'menu-lock');
      d.body.style.top = '';
      window.scrollTo({ top: sy, left: 0, behavior: 'instant' });
    }
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) burger.addEventListener('click', function () { menu(!d.body.classList.contains('menu-open')); });
  d.querySelectorAll('.mnav a').forEach(function (a) {
    a.addEventListener('click', function () { menu(false); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && d.body.classList.contains('menu-open')) { menu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180) menu(false); });

  // menu a tendina "Servizi" (tastiera e tocco)
  d.querySelectorAll('.dd > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.parentElement, open = p.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  d.addEventListener('click', function (e) {
    d.querySelectorAll('.dd.open').forEach(function (p) { if (!p.contains(e.target)) { p.classList.remove('open'); p.querySelector('button').setAttribute('aria-expanded', 'false'); } });
  });

  // entrate al passaggio
  var io = 'IntersectionObserver' in window;
  var rv = d.querySelectorAll('.rv');
  if (io && !reduce) {
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { o.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // numeri che salgono
  function fmt(n, dec) { var p = n.toFixed(dec).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return p.join(','); }
  var cs = d.querySelectorAll('[data-count]');
  function run(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0),
        pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t; var k = Math.min((t - t0) / dur, 1); k = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(to * k, dec) + suf; if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (io && !reduce) {
    var oc = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run(e.target); oc.unobserve(e.target); } }); }, { threshold: .4 });
    cs.forEach(function (el) { oc.observe(el); });
  }

  // manifesto: le parole si accendono scorrendo
  var man = d.querySelector('.manifesto');
  if (man && !reduce) {
    var ws = man.querySelectorAll('.w');
    function lit() {
      var r = man.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(Math.max((vh * .85 - r.top) / (r.height + vh * .35), 0), 1);
      var n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    }
    lit(); window.addEventListener('scroll', lit, { passive: true });
  } else if (man) man.querySelectorAll('.w').forEach(function (w) { w.classList.add('on'); });

  // video in loop: partono solo quando si vedono
  var loops = d.querySelectorAll('video[data-loop]');
  if (io) {
    var ov = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: .15 });
    loops.forEach(function (v) { ov.observe(v); });
  }

  // modulo preventivo → email (Web3Forms); senza chiave o in caso di errore → WhatsApp precompilato
  var WA = '393534244304', MAIL = 'info@frameagency.it';
  d.querySelectorAll('form[data-lead]').forEach(function (f) {
    var err = f.querySelector('.err'), ok = f.querySelector('.ok'), btn = f.querySelector('button[type="submit"]'), key = f.getAttribute('data-key');
    function val(n) { var el = f.elements[n]; return el ? el.value.trim() : ''; }
    function servizi() { return [].slice.call(f.querySelectorAll('input[name="servizi"]:checked')).map(function (c) { return c.value; }); }
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function tipo() { var c = val('contatto'); if (EMAIL_RE.test(c)) return 'email'; return c.replace(/\D/g, '').length >= 8 ? 'tel' : ''; }
    function segna(el, good) { el.setAttribute('aria-invalid', good ? 'false' : 'true'); }
    function check() {
      var n = f.elements.nome, c = f.elements.contatto, okN = !!val('nome'), okC = !!tipo();
      segna(n, okN); segna(c, okC);
      if (!okN || !okC) { err.textContent = !okN ? 'Scrivi il tuo nome.' : 'Scrivi un numero WhatsApp o un\'email valida.'; (!okN ? n : c).focus(); return false; }
      err.textContent = ''; return true;
    }
    ['nome', 'contatto'].forEach(function (n) { var el = f.elements[n]; if (el) el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') { segna(el, n === 'nome' ? !!val('nome') : !!tipo()); if (el.getAttribute('aria-invalid') === 'false') err.textContent = ''; } }); });
    function testo() {
      var sv = servizi(), r = ['Ciao FRAME Agency! Vorrei un preventivo gratuito.', '', 'Nome: ' + val('nome'), 'Contatto: ' + val('contatto')];
      if (sv.length) r.push('Mi serve: ' + sv.join(', '));
      if (val('messaggio')) r.push('Progetto: ' + val('messaggio'));
      return r.join('\n');
    }
    function whatsapp() {
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(testo());
      var w = window.open(url, '_blank'); if (w) w.opener = null; else location.href = url;
    }
    function fallito() {
      btn.disabled = false; btn.classList.remove('wait');
      err.innerHTML = 'Invio non riuscito. Scrivici su <a href="#" data-wa>WhatsApp</a> (messaggio già pronto) o a <a href="mailto:' + MAIL + '">' + MAIL + '</a>.';
      var l = err.querySelector('[data-wa]'); if (l) l.addEventListener('click', function (e) { e.preventDefault(); whatsapp(); });
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.elements.botcheck && f.elements.botcheck.checked) return;
      if (!check()) return;
      if (!key) { whatsapp(); return; }
      btn.disabled = true; btn.classList.add('wait');
      var t = tipo(), dati = {
        access_key: key,
        subject: 'Nuova richiesta preventivo dal sito — ' + val('nome'),
        from_name: 'Sito frameagency.it',
        Nome: val('nome'), Contatto: val('contatto') + (t === 'tel' ? ' (WhatsApp: https://wa.me/' + (function (n) { return n.length === 10 ? '39' + n : n; })(val('contatto').replace(/\D/g, '').replace(/^00/, '')) + ')' : ''),
        Servizi: servizi().join(', ') || '—', Progetto: val('messaggio') || '—',
        Pagina: location.pathname
      };
      if (t === 'email') { dati.email = val('contatto'); dati.replyto = val('contatto'); }
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(dati) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success !== false }; }); })
        .then(function (res) {
          if (!res.ok) return fallito();
          [].slice.call(f.children).forEach(function (c) { if (c !== ok) c.hidden = true; });
          ok.hidden = false; ok.focus && ok.setAttribute('tabindex', '-1'); ok.focus();
        })
        .catch(fallito);
    });
  });

  var y = d.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
})();
/* barra contatti su telefono: porta al modulo della pagina e si nasconde quando il modulo è visibile */
(function () {
  var bar = document.querySelector('.mbar'); if (!bar) return;
  var form = document.getElementById('richiesta'), link = bar.querySelector('[data-mbar]');
  if (form && link) link.setAttribute('href', '#richiesta');
  if (form && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { bar.classList.toggle('off', e.isIntersecting); }); }, { threshold: .08 }).observe(form);
  }
})();
