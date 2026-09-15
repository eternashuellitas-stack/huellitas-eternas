# Huellitas Eternas

Sitio web de Huellitas Eternas: recuerdos personalizados y memoriales digitales.

## Publicación con Git / GitHub Pages

Conserva exactamente las carpetas del proyecto. El workflow incluido en `.github/workflows/static.yml` puede publicar el sitio en GitHub Pages. El archivo `CNAME` está preparado para `https://eternashuellitas-stack.github.io/huellitas-eternas/index.html`.

## Formularios

Los formularios usan Web3Forms desde el navegador. La configuración existente se conserva en `assets/js/mejoras.js`.

## SEO y seguridad básica

- `robots.txt` permite indexar las páginas públicas y bloquea memoriales privados.
- `sitemap.xml` enumera las páginas públicas principales.
- `.well-known/security.txt` ofrece un contacto para avisos de seguridad.
- `referrer`, `noindex` en privados y enlaces externos con `noopener/noreferrer` mejoran la higiene del sitio.

### Importante sobre memoriales privados

`noindex` y `robots.txt` no son autenticación. Un archivo HTML estático que esté publicado en Internet puede abrirse si alguien conoce su URL. Para proteger información sensible hace falta autenticación del lado del servidor.
