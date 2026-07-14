# MVP de convocatorias e inscripciones de pádel

Aplicación web para crear partidas sueltas y jornadas de liga, convocar jugadores mediante enlaces personales y controlar confirmaciones, disponibilidad, lista de espera y selección del capitán.

## Estado del proyecto

Esta entrega es un MVP ejecutable y preparado para una prueba real controlada. Incluye:

- Panel de administración protegido por sesión.
- Alta y listado de jugadores.
- Consentimiento para comunicaciones por WhatsApp.
- Creación de partidas sueltas y jornadas de liga.
- Tres modalidades: inscripción directa, disponibilidad y selección.
- Enlaces personales firmados y con caducidad.
- Página móvil para responder sin contraseña.
- Control transaccional de plazas y lista de espera.
- Selección manual de jugadores desde administración.
- Gestión master para editar, duplicar y eliminar convocatorias.
- Eliminación administrativa de jugadores y sus datos asociados.
- Recordatorios masivos a todos los jugadores convocados.
- Modo WhatsApp de prueba sin enviar mensajes reales.
- Conector preparado para WhatsApp Business Platform Cloud API.
- Webhook para estados enviado, entregado, leído y fallido.
- Registro básico de auditoría.
- PostgreSQL, Docker y comprobación de salud.

No incluye todavía pagos, reservas de pistas, aplicación móvil nativa, importación masiva de jugadores, recordatorios programados ni creación automática de parejas.

## Tecnología

- Next.js 16 con App Router y TypeScript.
- React 19.
- PostgreSQL.
- Driver `pg`, sin ORM ni dependencia de binarios externos.
- Zod para validación.
- JWT firmado para sesiones y enlaces personales.
- Docker Compose para ejecutar una prueba local similar a producción.

## Inicio rápido con Docker

Requisitos:

- Docker y Docker Compose.
- Puertos 3000 y 5432 disponibles.

Ejecuta:

```bash
cp .env.example .env
docker compose up --build
```

Abre:

```text
http://localhost:3000
```

Acceso inicial del panel:

```text
Correo: admin@clubpadel.local
Contraseña: Cambiar123!
```

Cambia estas credenciales antes de publicar el proyecto.

El contenedor aplica el esquema de PostgreSQL y carga seis jugadores de demostración. El modo WhatsApp está configurado como `mock`, por lo que no envía mensajes reales. Desde el detalle de cada convocatoria puedes abrir el enlace como si fueras el jugador.

## Inicio sin Docker

Necesitas Node.js 22, pnpm y PostgreSQL.

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Para comprobar una compilación de producción:

```bash
pnpm lint
pnpm build
pnpm start
```

## Flujo de prueba recomendado

1. Entra en `/admin/login`.
2. Revisa o añade jugadores en `/admin/players`.
3. Crea una convocatoria en `/admin/events/new`.
4. Selecciona partida suelta o jornada de liga.
5. Selecciona los jugadores convocados.
6. Abre el detalle de la convocatoria.
7. Pulsa `Enviar o reenviar pendientes`.
8. En modo `mock`, abre `Abrir como jugador`.
9. Responde como jugador.
10. Regresa al panel y comprueba el estado actualizado.
11. En una jornada de liga, cambia un jugador disponible a `Seleccionado`.
12. Usa `Editar`, `Duplicar`, `Recordar a todos` o `Eliminar` desde el detalle de la convocatoria.

Los recordatorios utilizan el canal de WhatsApp configurado. En modo `mock` se registran sin enviar mensajes; en modo `live` reutilizan la plantilla aprobada configurada para la convocatoria.

## Variables de entorno

Copia `.env.example` y configura:

```dotenv
DATABASE_URL="postgresql://usuario:password@servidor:5432/base?sslmode=require"
APP_URL="https://padel.tudominio.com"
ADMIN_EMAIL="administracion@tudominio.com"
ADMIN_PASSWORD_HASH="hash-bcrypt"
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

Genera el hash de la contraseña administrativa:

```bash
pnpm hash:password -- 'UnaContraseñaMuySegura'
```

Guarda el resultado en `ADMIN_PASSWORD_HASH` y elimina `ADMIN_PASSWORD` en producción.

## Activar WhatsApp real

Primero prueba todo con:

```dotenv
WHATSAPP_MODE="mock"
```

Para activar envíos reales necesitas:

- Cuenta de Meta Business correctamente configurada.
- Número habilitado para WhatsApp Business Platform.
- Identificador del número.
- Token de acceso gestionado de forma segura.
- Plantilla aprobada por Meta.
- URL pública HTTPS para el webhook.
- Consentimiento acreditable de cada jugador.

Después configura:

```dotenv
WHATSAPP_MODE="live"
WHATSAPP_GRAPH_VERSION="v25.0"
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_ACCESS_TOKEN="..."
WHATSAPP_VERIFY_TOKEN="..."
WHATSAPP_TEMPLATE_NAME="convocatoria_padel"
```

Webhook:

```text
GET/POST https://tu-dominio.com/api/whatsapp/webhook
```

La plantilla esperada por el código contiene cuatro variables de cuerpo:

1. Nombre del jugador.
2. Título de la convocatoria.
3. Fecha y hora.
4. Club o sede.

También utiliza un botón URL dinámico cuyo sufijo es el token personal. La URL base configurada en la plantilla debe corresponder a:

```text
https://tu-dominio.com/i/{{1}}
```

Antes de producción, revisa la estructura exacta de la plantilla aprobada y adapta `src/lib/whatsapp.ts` si el orden de variables es diferente.

## Despliegue en producción con servidor o Docker

1. Contrata o prepara PostgreSQL con copias de seguridad.
2. Configura un dominio HTTPS.
3. Copia el proyecto al servidor.
4. Define las variables de entorno reales.
5. Ejecuta:

```bash
docker compose up --build -d
```

Para un servidor administrado sin Docker:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
NODE_ENV=production pnpm start
```

Utiliza un proxy inverso como Nginx o Caddy para HTTPS y limita el acceso directo al puerto 3000.

## Despliegue en Vercel

Consulta la guía paso a paso en [`DESPLIEGUE_VERCEL.md`](DESPLIEGUE_VERCEL.md).

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Añade una base PostgreSQL compatible.
4. Configura todas las variables para producción y preview.
5. Ejecuta `pnpm db:migrate` contra la base de producción desde una máquina o proceso CI autorizado.
6. Despliega.
7. Comprueba `/api/health`.
8. Mantén `WHATSAPP_MODE=mock` hasta completar la prueba funcional.
9. Cambia a `live` únicamente después de validar plantilla, webhook y consentimiento.

No ejecutes modificaciones manuales de tablas en producción. Actualiza `db/schema.sql`, documenta el cambio y prepara una migración incremental antes de evolucionar el sistema.

## Seguridad incluida

- Cookie de sesión `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Contraseñas administrativas verificables mediante bcrypt.
- Enlaces personales firmados con JWT.
- Caducidad del enlace vinculada a la fecha de la actividad.
- Versión de enlace para permitir revocaciones futuras.
- Respuestas registradas dentro de transacciones serializables.
- Control de capacidad antes de confirmar o seleccionar.
- Consentimiento de WhatsApp almacenado por jugador.
- Auditoría básica de altas, convocatorias y cambios de estado.
- Consultas parametrizadas contra PostgreSQL.

## Mejoras obligatorias antes de un uso amplio

- Recuperación segura de acceso administrativo.
- Autenticación multifactor para administradores.
- Gestión de varios administradores, capitanes y permisos.
- Limitación de peticiones por IP y por token.
- Protección CSRF reforzada para operaciones administrativas.
- Importación CSV con revisión de duplicados.
- Edición, cancelación y duplicado de convocatorias.
- Cron programado para recordatorios y cierre automático.
- Política completa de privacidad y textos legales.
- Exportación y eliminación de datos personales.
- Pruebas automatizadas de integración con PostgreSQL.
- Monitorización, alertas y copias de seguridad verificadas.
- Gestión de errores y reintentos de WhatsApp mediante cola.

## Estructura principal

```text
src/app/                         Interfaz y rutas HTTP
src/app/admin/                   Panel de administración
src/app/i/[token]/               Página personal del jugador
src/app/api/whatsapp/webhook/    Webhook de Meta
db/schema.sql                    Esquema inicial PostgreSQL
scripts/migrate.ts               Aplicación del esquema
scripts/seed.ts                  Datos de demostración
src/lib/repository.ts            Acceso a datos y reglas transaccionales
src/lib/whatsapp.ts              Modo mock y conexión Cloud API
src/lib/invitation-token.ts      Firma y validación de enlaces
PLAN_MAESTRO_PROYECTO.md         Especificación completa para continuar el desarrollo
```

## Criterio de finalización del piloto

El piloto puede considerarse válido cuando:

- Se registran al menos 20 jugadores reales con consentimiento.
- Se crean dos partidas sueltas y una jornada de liga.
- Cada jugador abre su enlace desde el móvil y responde correctamente.
- No se supera el número de plazas, aunque dos personas respondan simultáneamente.
- El capitán puede distinguir pendientes, disponibles, confirmados y suplentes.
- Los cambios se ven en el panel sin modificar datos manualmente.
- El webhook registra correctamente los estados de WhatsApp en modo real.
- Se ha probado una baja y una sustitución.
- La organización confirma que reduce trabajo respecto al sistema manual.

Consulta `PLAN_MAESTRO_PROYECTO.md` para la definición funcional y técnica completa.
