# Nequi Ts Orbit — Web

Sitio estático (HTML/CSS/JS) con sección **Consultar Nombres** (estilo Nequi).

## Notas de despliegue (Cloudflare Pages)
- No hay build. Framework: **None**. Output dir: raíz.
- Los **APK no van en el repo** (Pages limita a 25 MiB/archivo); se sirven desde el backend en `/apk/...`.
- La API de consultas **no está hardcodeada**: el navegador llama a `/api/consulta`
  (misma URL del sitio) y la Pages Function `functions/api/consulta.js` reenvía al backend.
  URL del backend configurable con la variable de entorno `CONSULTA_UPSTREAM`.
