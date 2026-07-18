// Cloudflare Pages Function — proxy de recarga (estado).
// El navegador llama a /api/recharge/status?reference=... (mismo origen); la
// URL real del backend vive aquí y es configurable con RECHARGE_UPSTREAM.

const DEFAULT_BASE = 'https://webconsulta.169-58-35-91.nip.io/api/v2/recharge';

export async function onRequestGet({ request, env }) {
  const base = (env && env.RECHARGE_UPSTREAM) || DEFAULT_BASE;
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || '';
  if (!reference) return json(400, { error: 'reference requerido' });

  const upstream = base.replace(/\/+$/, '') + '/status?reference=' + encodeURIComponent(reference);

  let resp;
  try {
    resp = await fetch(upstream, { method: 'GET' });
  } catch (_) {
    return json(503, { status: 'pending' });
  }

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
