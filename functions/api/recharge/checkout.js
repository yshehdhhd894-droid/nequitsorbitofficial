// Cloudflare Pages Function — proxy de recarga (checkout).
// El navegador llama a /api/recharge/checkout (mismo origen); la URL real del
// backend NO viaja al frontend: vive aquí (edge) y es configurable con la
// variable RECHARGE_UPSTREAM en el panel de Cloudflare Pages.

const DEFAULT_BASE = 'https://webconsulta.169-58-35-91.nip.io/api/v2/recharge';

export async function onRequestPost({ request, env }) {
  const base = (env && env.RECHARGE_UPSTREAM) || DEFAULT_BASE;
  const upstream = base.replace(/\/+$/, '') + '/checkout';

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
    return json(503, { error: 'No pudimos conectar con el servicio. Intenta de nuevo.' });
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
