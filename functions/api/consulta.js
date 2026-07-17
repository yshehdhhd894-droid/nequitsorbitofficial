// Cloudflare Pages Function — proxy de consulta.
// El navegador llama a /api/consulta (mismo origen); la URL real del backend
// NO viaja al frontend: vive aquí (edge) y es configurable por variable de
// entorno CONSULTA_UPSTREAM en el panel de Cloudflare Pages.

const DEFAULT_UPSTREAM = 'https://webconsulta.169-58-35-91.nip.io/api/consulta';

export async function onRequestPost({ request, env }) {
  const upstream = (env && env.CONSULTA_UPSTREAM) || DEFAULT_UPSTREAM;

  let body = '';
  try {
    body = await request.text();
  } catch (_) {
    body = '';
  }

  // Reenviamos la IP real del visitante para que el backend aplique su
  // límite "1 consulta por IP" correctamente.
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
    return json(503, {
      ok: false,
      unavailable: true,
      error: 'No pudimos conectar con el servicio. Intenta de nuevo.',
    });
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
