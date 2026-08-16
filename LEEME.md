# PZ · Puntualización Zonal — Cómo publicar

Esta carpeta contiene todo lo necesario para publicar tu plataforma como una
página web real, con su propio link, sin depender de Claude.

Los datos se guardan en el navegador de cada dispositivo (localStorage).
Usa Configuración → Copia de seguridad para exportar/importar datos entre
tu móvil y tu tablet.

## Opción más simple: Netlify Drop (sin instalar nada)

1. Necesitas tener Node.js instalado en tu ordenador (una sola vez):
   https://nodejs.org (descarga la versión LTS).
2. Abre una terminal dentro de esta carpeta y ejecuta:
   ```
   npm install
   npm run build
   ```
   Esto crea una carpeta llamada `dist`.
3. Ve a https://app.netlify.com/drop y arrastra la carpeta `dist` completa.
4. En segundos obtienes un link público, por ejemplo:
   `https://pz-puntualizacion-zonal.netlify.app`
5. Puedes cambiar ese nombre desde el panel de Netlify (Site settings → Change site name).

## Opción recomendada si vas a pedir cambios seguido: Vercel + GitHub

1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a https://vercel.com, conecta tu cuenta de GitHub e importa el repositorio.
3. Vercel detecta automáticamente que es un proyecto Vite y lo publica.
4. Cada vez que subas una actualización del código a GitHub, Vercel la publica sola.

## Importante

- Publica la versión de este archivo tal cual: usa `localStorage`, así que
  funciona de forma independiente, sin necesitar a Claude ni conexión a
  ningún servicio externo.
- Si más adelante quieres que los datos se sincronicen automáticamente entre
  tu móvil y tu tablet (sin exportar/importar a mano), el siguiente paso es
  conectar una base de datos en la nube (por ejemplo Firebase o Supabase,
  ambos con plan gratuito). Es un cambio adicional que podemos preparar
  cuando quieras.
