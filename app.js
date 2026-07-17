// ===== Nequi Tsorbit — interactividad =====
(function () {
  'use strict';

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // ---------- Fondo orbital de chispas ----------
  var canvas = document.getElementById('orbit-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var w, h, particles;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      var count = Math.min(90, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,196,81,0.8)';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(232,178,58,' + (0.16 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  // ---------- Transición 3D con el mouse en cada botón/tarjeta ----------
  var tiltEls = document.querySelectorAll('.tilt3d');
  tiltEls.forEach(function (el) {
    var maxTilt = el.classList.contains('card') ? 12 : 8;

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var rx = ((e.clientY - cy) / rect.height) * -2 * maxTilt;
      var ry = ((e.clientX - cx) / rect.width) * 2 * maxTilt;
      el.style.transform =
        'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(30px) scale(1.05)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  });

  // ---------- Recargas y Soporte: modal de contactos ----------
  var rev = function (s) { return s.split('').reverse().join(''); };
  var MSG = encodeURIComponent('Hola deseo adquirir o recargar un usuario');

  var TG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#29a9eb"/>' +
    '<path fill="#fff" d="M5.5 11.6l11.4-4.4c.53-.19 1 .13.83.94l-1.94 9.15c-.14.66-.53.82-1.08.51l-3-2.21-1.45 1.4c-.16.16-.29.29-.6.29l.21-3.05 5.55-5.01c.24-.21-.05-.33-.38-.12l-6.86 4.32-2.96-.92c-.64-.2-.65-.64.14-.95z"/></svg>';

  var WA = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25d366"/>' +
    '<path fill="#fff" d="M12.04 5.5c-3.58 0-6.5 2.9-6.5 6.48 0 1.14.3 2.26.87 3.24L5.5 18.5l3.38-.88c.94.51 2 .78 3.08.78h.01c3.58 0 6.5-2.9 6.5-6.48 0-1.73-.68-3.36-1.9-4.58a6.46 6.46 0 0 0-4.53-1.84zm3.8 9.16c-.16.45-.94.86-1.3.89-.33.04-.75.05-1.21-.08-.28-.09-.64-.2-1.1-.4-1.94-.84-3.2-2.79-3.3-2.92-.1-.13-.79-1.05-.79-2s.5-1.42.68-1.61c.18-.19.39-.24.52-.24l.37.01c.12 0 .28-.05.44.34.16.39.54 1.35.59 1.45.05.1.08.21.02.34-.06.13-.09.21-.18.32l-.27.31c-.09.09-.18.19-.08.37.1.18.44.73.95 1.18.65.58 1.2.76 1.38.85.18.09.29.08.39-.05.1-.13.45-.53.57-.71.12-.18.24-.15.4-.09.16.06 1.05.5 1.23.59.18.09.3.13.34.21.04.08.04.44-.12.89z"/></svg>';

  // Datos con enlaces ofuscados (invertidos) para no exponerlos en el HTML
  var CONTACTS = [
    { cls: 'tg', icon: TG, name: 'AXONDEVUI', type: 'Telegram',
      build: function () { return 'https://t.me/' + rev('iuvednoxa') + '?text=' + MSG; } },
    { cls: 'tg', icon: TG, name: 'RAXELTSUI', type: 'Telegram',
      build: function () { return 'https://t.me/' + rev('iustlexar') + '?text=' + MSG; } },
    { cls: 'wa', icon: WA, name: 'WhatsApp 1', type: 'WhatsApp',
      build: function () { return 'https://wa.me/' + rev('248531081375') + '?text=' + MSG; } },
    { cls: 'wa', icon: WA, name: 'WhatsApp 2', type: 'WhatsApp',
      build: function () { return 'https://wa.me/' + rev('77738955481') + '?text=' + MSG; } },
  ];

  var contactsEl = document.getElementById('contacts');
  if (contactsEl) {
    CONTACTS.forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'contact ' + c.cls;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<span class="ci">' + c.icon + '</span>' +
        '<span class="cmeta"><span class="cname">' + c.name + '</span>' +
        '<span class="ctype">' + c.type + '</span></span>';
      // El enlace real se resuelve solo al hacer clic (queda oculto)
      a.addEventListener('click', function () { a.setAttribute('href', c.build()); });
      contactsEl.appendChild(a);
    });
  }

  // ---------- Sistema de modales genérico ----------
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    var vid = modal.querySelector('video');
    if (vid) vid.pause();
  }
  function closeAll() {
    document.querySelectorAll('.modal.open').forEach(closeModal);
  }

  // Abrir cualquier modal con [data-open="id"]
  document.querySelectorAll('[data-open]').forEach(function (el) {
    var target = function () { return document.getElementById(el.getAttribute('data-open')); };
    el.addEventListener('click', function () { openModal(target()); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(target()); }
    });
  });

  // Cerrar
  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () { closeModal(modal); });
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  // ---------- Descarga de APK con confirmación ----------
  var pendingDownload = null;
  var dlModal = document.getElementById('download-modal');
  var dlName = document.getElementById('download-name');
  var dlConfirm = document.getElementById('download-confirm');

  document.querySelectorAll('[data-download]').forEach(function (el) {
    el.addEventListener('click', function () {
      pendingDownload = {
        url: el.getAttribute('data-download'),
        name: el.getAttribute('data-filename') || 'app.apk',
      };
      if (dlName) dlName.textContent = '¿Deseas descargar ' + pendingDownload.name + '?';
      openModal(dlModal);
    });
  });

  if (dlConfirm) {
    dlConfirm.addEventListener('click', function () {
      if (!pendingDownload) return;
      var a = document.createElement('a');
      a.href = pendingDownload.url;
      a.download = pendingDownload.name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (dlName) dlName.textContent = 'Descarga iniciada: ' + pendingDownload.name;
      setTimeout(function () { closeModal(dlModal); }, 900);
    });
  }

  // ---------- Sistema de vistas (secciones) ----------
  function showView(id) {
    var target = document.getElementById(id);
    if (!target) return;
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    target.classList.add('active');
    closeAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-view]').forEach(function (el) {
    el.addEventListener('click', function () { showView(el.getAttribute('data-view')); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showView(el.getAttribute('data-view')); }
    });
  });

  // Navegación (vuelve a Home y hace scroll a la sección)
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showView('view-home');
      var id = (a.getAttribute('href') || '').replace('#', '');
      setTimeout(function () {
        var t = document.getElementById(id);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });
  });

  // ---------- Consultar Nombres (estilo Nequi + 1 consulta de prueba) ----------
  // URL del backend propio (proxy que oculta la API key y controla la prueba).
  var CONSULTA_API = 'https://webconsulta.3-144-161-128.nip.io/api/consulta';
  var USED_KEY = 'nt_consulta_prueba_usada';

  var cForm = document.getElementById('consultar-form');
  var cInput = document.getElementById('consultar-input');
  var cBtn = document.getElementById('consultar-btn');
  var cHint = document.getElementById('consultar-hint');
  var elLoading = document.getElementById('consultar-loading');
  var elOk = document.getElementById('consultar-ok');
  var elFail = document.getElementById('consultar-fail');
  var elUsed = document.getElementById('consultar-used');

  function alreadyUsed() {
    try { return localStorage.getItem(USED_KEY) === '1'; } catch (_) { return false; }
  }
  function markUsed() {
    try { localStorage.setItem(USED_KEY, '1'); } catch (_) {}
  }
  function hideStates() {
    [elLoading, elOk, elFail, elUsed].forEach(function (el) { if (el) el.hidden = true; });
  }
  function showUsedState() {
    hideStates();
    if (elUsed) elUsed.hidden = false;
    if (cForm) cForm.hidden = true;
  }
  function capWords(s) {
    return String(s || '').toLowerCase().replace(/\b\p{L}/gu, function (c) { return c.toUpperCase(); });
  }

  if (cInput) {
    // Solo dígitos, máximo 10.
    cInput.addEventListener('input', function () {
      cInput.value = cInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  if (cForm) {
    // Si ya usó la prueba, bloquear de una.
    if (alreadyUsed()) showUsedState();

    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (alreadyUsed()) { showUsedState(); return; }

      var numero = (cInput.value || '').replace(/\D/g, '');
      if (numero.length !== 10) {
        if (cHint) { cHint.textContent = 'Ingresa un número válido de 10 dígitos.'; cHint.style.color = '#ff9ccf'; }
        cInput.focus();
        return;
      }

      hideStates();
      if (elLoading) elLoading.hidden = false;
      if (cBtn) { cBtn.disabled = true; cBtn.classList.add('is-loading'); }
      if (cInput) cInput.disabled = true;

      fetch(CONSULTA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: numero }),
      })
        .then(function (r) {
          return r.json().then(function (data) { return { status: r.status, data: data }; });
        })
        .then(function (res) {
          var data = res.data || {};

          // Límite alcanzado según el backend (por IP).
          if (res.status === 429 || data.limited) {
            markUsed();
            showUsedState();
            return;
          }

          // Motor no disponible: NO consume la prueba, el usuario puede reintentar.
          if (res.status === 503 || data.unavailable) {
            hideStates();
            var ftu = document.getElementById('fail-title');
            var fmu = document.getElementById('fail-msg');
            if (ftu) ftu.textContent = 'Servicio ocupado';
            if (fmu) fmu.textContent = data.error || 'El motor está ocupado. Intenta de nuevo en un momento.';
            if (elFail) elFail.hidden = false;
            return;
          }

          hideStates();

          if (data.ok) {
            markUsed();
            var setTxt = function (id, v) { var n = document.getElementById(id); if (n) n.textContent = v; };
            setTxt('res-nombre', capWords(data.nombre) || '—');
            setTxt('res-doc', data.documento || '—');
            setTxt('res-num', data.numero || numero);
            var trow = document.getElementById('res-tiempo-row');
            if (data.tiempo) { setTxt('res-tiempo', data.tiempo); if (trow) trow.hidden = false; }
            else if (trow) trow.hidden = true;
            if (elOk) elOk.hidden = false;
            if (cForm) cForm.hidden = true;
          } else {
            // Consulta completada pero sin resultado: consume la prueba igual.
            markUsed();
            var ft = document.getElementById('fail-title');
            var fm = document.getElementById('fail-msg');
            if (data.invalid_phone) {
              if (ft) ft.textContent = 'Número inválido';
              if (fm) fm.textContent = 'Verifica el número e inténtalo con soporte.';
            } else {
              if (ft) ft.textContent = 'Sin resultados';
              if (fm) fm.textContent = data.error || 'No encontramos un titular para ese número.';
            }
            if (elFail) elFail.hidden = false;
            if (cForm) cForm.hidden = true;
          }
        })
        .catch(function () {
          // Error de red: NO consume la prueba, el usuario puede reintentar.
          hideStates();
          var ft = document.getElementById('fail-title');
          var fm = document.getElementById('fail-msg');
          if (ft) ft.textContent = 'No pudimos conectar';
          if (fm) fm.textContent = 'Revisa tu conexión e inténtalo de nuevo.';
          if (elFail) elFail.hidden = false;
        })
        .finally(function () {
          if (elLoading) elLoading.hidden = true;
          if (cBtn) { cBtn.disabled = false; cBtn.classList.remove('is-loading'); }
          if (cInput) cInput.disabled = false;
        });
    });
  }

  // ---------- Emblema: tilt 3D suave ----------
  var emblem = document.querySelector('.hero-emblem');
  if (emblem) {
    emblem.addEventListener('mousemove', function (e) {
      var rect = emblem.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var rx = ((e.clientY - cy) / rect.height) * -14;
      var ry = ((e.clientX - cx) / rect.width) * 14;
      emblem.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    emblem.addEventListener('mouseleave', function () {
      emblem.style.transform = 'rotateX(0) rotateY(0)';
    });
  }
})();
