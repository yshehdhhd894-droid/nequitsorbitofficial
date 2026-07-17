// Cloudflare Pages Function — proxy del historial de consulta.
// El navegador llama a /api/historial (mismo origen); recupera la consulta de
// prueba guardada en el backend por fingerprint/token (no se pierde).

const DEFAULT_UPSTREAM = 'https://webconsulta.169-58-35-91.nip.io/api/historial';

export async function onRequestPost({ request, env }) {
  const base = (env && env.CONSULTA_UPSTREAM) || 'https://webconsulta.169-58-35-91.nip.io/api/consulta';
  const upstream = (env && env.HISTORIAL_UPSTREAM) || base.replace(/\/consulta$/, '/historial') || DEFAULT_UPSTREAM;

  let body = '';
  try {
    body = await request.text();
  } catch (_) {
    body = '';
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';

  let resp;
  try {
    resp = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ip ? { 'X-Forwarded-For': ip, 'X-Real-IP': ip } : {}),
      },
      body,
    });
  } catch (_) {
    return json(200, { ok: true, used: false, result: null });
  }

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
  });
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
