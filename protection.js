// ===== Nequi Tsorbit — Protección Anti-DevTools =====
// Estrategia: la sentencia `debugger` NO hace nada cuando las DevTools están
// cerradas, por lo que no genera FALSOS POSITIVOS. Solo pausa la ejecución
// (efecto "Debugger paused / Paused in debugger") cuando el usuario abre las
// herramientas de desarrollo. Además se bloquean las teclas típicas (F12, etc.).
//
// Para DESACTIVAR durante el desarrollo:
//   añade  ?dev=1  a la URL   ó   localStorage.setItem('nt_dev','1')
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var DEV_MODE =
    params.get('dev') === '1' ||
    (window.localStorage && localStorage.getItem('nt_dev') === '1');

  if (DEV_MODE) {
    console.info('%cNequi Tsorbit — modo desarrollo (protección desactivada)', 'color:#00e5ff');
    return;
  }

  // ---------- 1) Bloqueo de teclas ----------
  function blockKeys(e) {
    var k = e.key || '';
    var code = e.keyCode || 0;

    var isF12 = k === 'F12' || code === 123;
    var ctrlShift = e.ctrlKey && e.shiftKey;
    // Ctrl+Shift+I / J / C  (inspector, consola, selector)
    var devCombo = ctrlShift && ['I', 'J', 'C', 'i', 'j', 'c'].indexOf(k) !== -1;
    // Ctrl+U  (ver código fuente)
    var viewSource = e.ctrlKey && (k === 'U' || k === 'u' || code === 85);

    if (isF12 || devCombo || viewSource) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
  window.addEventListener('keydown', blockKeys, true);

  // Bloqueo opcional del menú contextual (clic derecho)
  window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  }, true);

  // ---------- 2) "Debugger paused" sin falsos positivos ----------
  // Se ejecuta en bucle. Sin DevTools abiertas es una operación nula (no molesta
  // al usuario ni se nota). Con DevTools abiertas, el navegador se detiene aquí.
  function debuggerTrap() {
    (function () {
      // Se reconstruye la función en cada ciclo para dificultar el bypass.
      return false;
    })
    ['constructor']('debugger')
    ();
  }

  // ---------- 3) Detección por tiempo (refuerzo, tolerante) ----------
  // Mide cuánto tarda el bucle. Un `debugger` con DevTools abiertas introduce una
  // pausa notable. El umbral es alto para NO disparar en equipos lentos.
  var THRESHOLD = 300; // ms — margen amplio => sin falsos positivos
  var triggered = false;

  function guardLoop() {
    var start = performance.now();
    try { debuggerTrap(); } catch (_) {}
    var elapsed = performance.now() - start;

    if (elapsed > THRESHOLD) {
      // DevTools detectadas de forma fiable (hubo pausa real en el debugger).
      if (!triggered) {
        triggered = true;
        onDevToolsOpen();
      }
    }
  }

  function onDevToolsOpen() {
    // Refuerza la pausa de forma continua mientras estén abiertas.
    setInterval(debuggerTrap, 50);
  }

  // Ciclo principal ligero
  setInterval(guardLoop, 1000);
  // Primer disparo inmediato
  guardLoop();

  // Mensaje de aviso en consola
  var css = 'color:#ff2bd6;font-size:22px;font-weight:900;text-shadow:0 0 8px #7a2bff;';
  setTimeout(function () {
    try {
      console.log('%c⛔ NEQUI TSORBIT — ÁREA PROTEGIDA', css);
      console.log('%cEl acceso a las herramientas de desarrollo está restringido.', 'color:#a99fce;font-size:13px;');
    } catch (_) {}
  }, 500);
})();
