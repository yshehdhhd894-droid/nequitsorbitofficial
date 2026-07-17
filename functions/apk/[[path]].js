// Cloudflare Pages Function — proxy de descarga de APK.
// Sirve las APK a través del dominio propio de la web para que el usuario
// NUNCA vea el dominio del VPS. La URL real del backend vive en el edge y
// es configurable con la variable de entorno APK_UPSTREAM (base sin /apk).
//
// Ej: /apk/NequiCol.apk  ->  https://webconsulta.169-58-35-91.nip.io/apk/NequiCol.apk

const DEFAULT_UPSTREAM = 'https://webconsulta.169-58-35-91.nip.io/apk';

export async function onRequestGet({ request, params, env }) {
  const base = ((env && env.APK_UPSTREAM) || DEFAULT_UPSTREAM).replace(/\/+$/, '');

  const segs = Array.isArray(params.path) ? params.path : [params.path];
  const file = segs.filter(Boolean).join('/');

  // Solo nombres .apk simples: evita path traversal / SSRF.
  if (!/^[A-Za-z0-9._-]+\.apk$/.test(file)) {
    return new Response('Not found', { status: 404 });
  }

  let resp;
  try {
    resp = await fetch(`${base}/${file}`, {
      method: 'GET',
      headers: { 'User-Agent': request.headers.get('User-Agent') || 'apk-proxy' },
    });
  } catch (_) {
    return new Response('Servicio de descarga no disponible', { status: 503 });
  }

  if (!resp.ok) {
    return new Response('APK no encontrada', { status: resp.status });
  }

  // Nombre de descarga: respeta ?dl= (permite espacios) o el atributo download
  // del enlace (data-filename). Sin filename forzado, el navegador usa ese nombre.
  const url = new URL(request.url);
  const want = (url.searchParams.get('dl') || '').trim();
  const disposition = /^[\w .()+-]{1,80}\.apk$/.test(want)
    ? `attachment; filename="${want}"`
    : 'attachment';

  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set('Content-Disposition', disposition);
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('X-Content-Type-Options', 'nosniff');
  const len = resp.headers.get('Content-Length');
  if (len) headers.set('Content-Length', len);

  return new Response(resp.body, { status: 200, headers });
}
