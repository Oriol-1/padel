# Despliegue en Vercel

El repositorio se publica inicialmente con `DEMO_MODE=true` en `vercel.json`. Este modo permite revisar el panel con datos ficticios sin PostgreSQL; no guarda cambios ni envía mensajes. Cuando conectes Neon, elimina esa variable de `vercel.json`, configura `DEMO_MODE=false` y vuelve a desplegar.

## 1. Importar el repositorio

1. Entra en [Vercel](https://vercel.com/new).
2. Importa `https://github.com/Oriol-1/padel`.
3. Mantén `Next.js` como framework y la carpeta raíz del repositorio.
4. Vercel detectará `pnpm-lock.yaml` y utilizará la versión de `pnpm` declarada en `package.json`.

## 2. Crear PostgreSQL

Vercel necesita una base PostgreSQL externa y persistente. Puedes conectar Neon, Supabase u otro proveedor desde `Storage` o pegar su URL manualmente.

Usa una URL con cifrado SSL y, para funciones serverless, el endpoint con pool de conexiones que proporcione el servicio:

```dotenv
DATABASE_URL="postgresql://usuario:password@host/base?sslmode=require"
DB_POOL_MAX="2"
```

No reutilices la base local de demostración.

## 3. Variables de entorno

Configura estas variables en `Project Settings > Environment Variables`. Aplica las definitivas a `Production`; para `Preview` utiliza otra base o evita operaciones con datos reales.

La compilación puede completarse sin secretos gracias a valores internos usados únicamente durante `next build`, pero la aplicación desplegada exige las variables reales para funcionar. Estos valores internos nunca se utilizan para atender peticiones.

```dotenv
DATABASE_URL="postgresql://...?...sslmode=require"
DB_POOL_MAX="2"
APP_URL="https://tu-proyecto.vercel.app"
ADMIN_EMAIL="administracion@tudominio.com"
ADMIN_PASSWORD_HASH="$2b$..."
SESSION_SECRET="clave-aleatoria-de-al-menos-32-caracteres"
CLUB_TIMEZONE="Europe/Madrid"
CLUB_NAME="Nombre del club"
WHATSAPP_MODE="mock"
WHATSAPP_GRAPH_VERSION="v25.0"
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN="token-secreto-webhook"
WHATSAPP_TEMPLATE_NAME="convocatoria_padel"
WHATSAPP_TEMPLATE_LANGUAGE="es"
```

No configures `ADMIN_PASSWORD` en producción. Genera el hash localmente:

```bash
corepack pnpm hash:password -- 'UnaContraseñaLargaYUnica'
```

Genera `SESSION_SECRET` con un gestor de contraseñas o un generador criptográfico. No uses el valor de `.env.example`.

`APP_URL` debe coincidir con el dominio de producción y no debe terminar en `/`. Si después conectas un dominio propio, actualiza esta variable y vuelve a desplegar.

Si omites `APP_URL` en Vercel, la aplicación intentará utilizar automáticamente `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`. Es preferible configurarla explícitamente cuando conectes el dominio definitivo.

## 4. Crear el esquema

La compilación no modifica la base de datos. Antes de abrir la aplicación, ejecuta una vez la migración desde este proyecto con `DATABASE_URL` apuntando a la base remota:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm db:migrate
```

La carga de los seis jugadores ficticios es opcional y no se recomienda para producción:

```bash
corepack pnpm db:seed
```

## 5. Desplegar y comprobar

1. Pulsa `Deploy` o vuelve a desplegar después de configurar las variables.
2. Abre `https://tu-dominio/api/health` y comprueba que devuelve `status: ok` y `database: ok`.
3. Accede a `/admin/login` con el correo y contraseña cuyo hash configuraste.
4. Mantén `WHATSAPP_MODE=mock` durante toda la validación inicial.

## 6. Activar WhatsApp después

Para pasar a `live` necesitas el número de Meta, token, plantilla aprobada y webhook público. Configura el webhook como:

```text
GET/POST https://tu-dominio/api/whatsapp/webhook
```

Después actualiza las variables `WHATSAPP_*` y despliega de nuevo. El correo electrónico no forma parte de este MVP y requiere integrar un proveedor adicional antes de poder utilizarse.

## Límites operativos

- Los envíos y recordatorios se procesan dentro de una función con duración máxima solicitada de 60 segundos.
- Para volúmenes altos será necesario sustituir el bucle de envío por una cola de trabajos.
- La base debe aceptar conexiones desde Vercel y ofrecer un endpoint con pool serverless.
- Las migraciones futuras deben ejecutarse de forma controlada; no deben añadirse al comando automático de build.
