// Cloudflare Pages Function — proxy de cuentas web e historial privado.
const DEFAULT_BASE =
  'http://nequi-orbytek.169-58-35-91.nip.io/api/v2/web-account';
const ALLOWED_PATHS = new Set([
  'register',
  'login',
  'logout',
  'me',
  'purchases',
  'forgot',
  'reset',
]);

export async function onRequest({ request, env, params }) {
  const path = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  if (!ALLOWED_PATHS.has(path)) {
    return json(404, { error: 'Ruta no encontrada' });
  }

  const rechargeBase = env && env.RECHARGE_UPSTREAM;
  const derivedBase = rechargeBase
    ? rechargeBase.replace(/\/recharge\/?$/, '/web-account')
    : '';
  const base = (env && env.ACCOUNT_UPSTREAM) || derivedBase || DEFAULT_BASE;
  const upstream = base.replace(/\/+$/, '') + '/' + path;
  const authorization = request.headers.get('Authorization') || '';
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' },
    });
  }
  if (method !== 'GET' && method !== 'POST') {
    return json(405, { error: 'Método no permitido' });
  }

  let response;
  try {
    response = await fetch(upstream, {
      method,
      headers: {
        Accept: 'application/json',
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        ...(ip ? { 'X-Forwarded-For': ip, 'X-Real-IP': ip } : {}),
      },
      ...(method === 'POST' ? { body: await request.text() } : {}),
    });
  } catch (_) {
    return json(503, {
      error: 'No pudimos conectar con el servicio. Intenta de nuevo.',
    });
  }

  return new Response(await response.text(), {
    status: response.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
