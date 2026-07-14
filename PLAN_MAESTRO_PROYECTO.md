# Plan maestro ejecutable: plataforma de convocatorias de pádel

**Versión:** 1.0  
**Fecha:** 14 de julio de 2026  
**Estado:** MVP ejecutable preparado para piloto controlado  
**Nombre provisional:** Padel Convoca

## 1. Instrucción principal para desarrollo o IA de programación

Construir, mantener y desplegar una plataforma web móvil para que una organización de pádel pueda crear partidas sueltas y jornadas de liga, convocar jugadores por WhatsApp mediante enlaces personales, recibir respuestas y gestionar confirmados, disponibilidad, lista de espera, selección, bajas y suplencias.

La plataforma debe reducir al mínimo los mensajes manuales. WhatsApp será el canal de entrada, pero la fuente de verdad será siempre la base de datos de la aplicación.

No se debe sustituir la integración oficial de WhatsApp por automatizaciones de WhatsApp Web, extensiones de navegador, scraping o herramientas que simulen comportamiento humano.

## 2. Resultado que debe conseguir el producto

El organizador debe poder completar este flujo:

1. Registrar jugadores y su autorización para WhatsApp.
2. Crear una partida suelta o una jornada de liga.
3. Definir fecha, hora, sede, categoría, plazas, límite y modalidad.
4. Elegir los jugadores convocados.
5. Publicar la convocatoria.
6. Enviar un mensaje personal con enlace.
7. Ver quién lo ha recibido, abierto y respondido.
8. Completar las plazas o seleccionar la alineación.
9. Resolver bajas y suplencias.
10. Mantener un historial auditable.

El jugador debe completar este flujo desde el móvil:

1. Recibir el mensaje.
2. Pulsar el enlace.
3. Ver claramente la actividad y su estado.
4. Apuntarse, declararse disponible o indicar que no puede asistir.
5. Añadir una observación opcional.
6. Recibir una confirmación inequívoca.
7. Poder volver a abrir el enlace mientras sea válido.

## 3. Alcance del MVP

### Incluido

- Un club u organización.
- Un administrador inicial.
- Jugadores con nombre, teléfono, correo opcional, categoría y nivel.
- Consentimiento de WhatsApp.
- Partidas sueltas.
- Jornadas de liga.
- Inscripción directa.
- Declaración de disponibilidad.
- Disponibilidad y selección manual.
- Enlaces individuales firmados.
- Lista de espera automática.
- Selección administrativa.
- Modo de prueba WhatsApp.
- Envío real mediante Cloud API, condicionado a credenciales y plantilla.
- Webhook de estados.
- Auditoría básica.
- PostgreSQL.
- Despliegue mediante Docker o plataforma Node.js.

### Fuera del MVP

- Cobro de pistas.
- Reserva física de pistas.
- Acceso mediante QR a instalaciones.
- Ranking avanzado.
- Chat entre jugadores.
- Aplicación móvil nativa.
- Gestión completa de torneos.
- Facturación.
- Multiclub.
- Automatización avanzada de alineaciones.

## 4. Roles

### Administrador

Puede gestionar toda la plataforma, jugadores, convocatorias, envíos y estados.

### Capitán u organizador

Rol previsto para la segunda fase. Tendrá acceso limitado a los equipos y jornadas asignados.

### Jugador

No necesita una contraseña para responder a una convocatoria concreta. Utiliza un enlace personal firmado y limitado a esa actividad.

## 5. Tipos de convocatoria

### Partida suelta

Se utiliza para cubrir un número fijo de plazas. La regla predeterminada es por orden de confirmación.

Cuando se completa el aforo:

- Los siguientes jugadores pasan a lista de espera.
- Cada jugador obtiene una posición.
- Una baja debe liberar la plaza.
- En una fase posterior, el sistema ofrecerá la plaza al primer suplente durante un plazo limitado.

### Jornada de liga

Se utiliza para preguntar disponibilidad a una plantilla y seleccionar después la alineación.

Flujo:

1. Se convoca a la plantilla elegible.
2. Los jugadores responden disponible o no disponible.
3. El capitán consulta observaciones.
4. Selecciona titulares y reservas.
5. El sistema comunica la selección en una fase posterior.

## 6. Modalidades de respuesta

### DIRECT

- Acción positiva del jugador: `CONFIRMED`.
- Si quedan plazas, queda confirmado.
- Si no quedan plazas, queda en `WAITLISTED`.

### AVAILABILITY

- Acción positiva del jugador: `AVAILABLE`.
- No ocupa una plaza definitiva.
- El organizador decide posteriormente.

### SELECTION

- Acción positiva inicial: `AVAILABLE`.
- El administrador puede convertirla en `SELECTED` o `NOT_SELECTED`.
- El número de seleccionados no puede superar la capacidad.

## 7. Estados

### Convocatoria

- `DRAFT`: creada y no publicada.
- `PUBLISHED`: publicada o enviada.
- `CLOSED`: respuestas cerradas.
- `CANCELLED`: cancelada.
- `COMPLETED`: finalizada.

### Invitación

- `PENDING`: todavía no enviada.
- `SENT`: mensaje generado o enviado.
- `OPENED`: enlace abierto.
- `RESPONDED`: jugador ha respondido.
- `FAILED`: error de envío.

### Respuesta del jugador

- `PENDING`.
- `CONFIRMED`.
- `AVAILABLE`.
- `DECLINED`.
- `WAITLISTED`.
- `SELECTED`.
- `NOT_SELECTED`.
- `CANCELLED`.

## 8. Reglas de negocio obligatorias

1. Un jugador no puede tener dos invitaciones para la misma convocatoria.
2. La fecha final debe ser posterior a la fecha inicial.
3. La fecha límite no puede superar el inicio.
4. La capacidad estará entre 1 y 100 en el MVP.
5. La suma de `CONFIRMED` y `SELECTED` no puede superar la capacidad.
6. La última plaza se asignará dentro de una transacción serializable.
7. Una invitación solo puede utilizarse con el enlace y versión correctos.
8. Un enlace deja de ser válido cuando supera su caducidad o se incrementa su versión.
9. Una convocatoria cancelada o cerrada no admite respuestas.
10. Solo se enviará WhatsApp automático a jugadores con consentimiento registrado.
11. El teléfono debe usar formato internacional E.164.
12. Los datos del resto de jugadores no se muestran en la página pública.
13. Toda modificación administrativa relevante debe registrarse en auditoría.
14. Las consultas SQL deben ser parametrizadas.
15. La aplicación debe utilizar la zona horaria del club para mostrar y convertir fechas.

## 9. Pantallas

### Públicas

- Inicio.
- Invitación personal `/i/[token]`.
- Página de enlace no válido.

### Administración

- Inicio de sesión.
- Resumen.
- Lista y alta de jugadores.
- Lista de convocatorias.
- Nueva convocatoria.
- Detalle y gestión de convocatoria.

### Próximas pantallas

- Edición de jugador.
- Edición y duplicado de convocatoria.
- Importación CSV.
- Historial de envíos.
- Configuración de plantillas.
- Usuarios y permisos.
- Informes.

## 10. Modelo de datos

### players

Fuente maestra de jugadores y consentimiento.

Campos principales:

- `id`.
- `first_name`.
- `last_name`.
- `phone` único.
- `email` único opcional.
- `category`.
- `level`.
- `active`.
- `whatsapp_consent`.
- `consent_text_version`.
- `consented_at`.

### events

Representa partida o jornada.

Campos:

- Tipo.
- Modalidad.
- Estado.
- Inicio y final.
- Fecha límite.
- Sede y dirección.
- Capacidad.
- Categoría.
- Precio informativo.
- Descripción.
- Autor.

### invitations

Relación única entre evento y jugador. Guarda estado de envío, respuesta, observación, posición en espera y versión del enlace.

### outbound_messages

Guarda mensaje, destinatario, plantilla, estado de proveedor, identificador externo, errores y marcas temporales.

### audit_logs

Registra actor, acción, entidad, identificador, metadatos y fecha.

## 11. Arquitectura técnica

### Aplicación

- Next.js 16.
- TypeScript estricto.
- App Router.
- Renderizado de servidor para el panel.
- Formularios HTML y rutas POST para reducir complejidad del piloto.

### Datos

- PostgreSQL.
- Driver `pg`.
- Repositorio central en `src/lib/repository.ts`.
- Transacciones para creación y asignación de plazas.
- SQL inicial en `db/schema.sql`.

### Seguridad

- Sesión de administrador firmada.
- Cookie HttpOnly.
- Enlaces JWT firmados.
- Bcrypt para contraseña.
- Validación Zod.
- Variables de entorno.
- Auditoría.

### Mensajería

- Modo `mock` para probar el proyecto sin coste ni aprobación.
- Modo `live` mediante Graph API.
- Webhook de estados.
- El dominio deportivo no debe depender directamente de detalles de Meta.

## 12. API interna

### Autenticación

- `POST /api/auth/login`.
- `POST /api/auth/logout`.

### Administración

- `POST /api/admin/players`.
- `POST /api/admin/events`.
- `POST /api/admin/events/[id]/send`.
- `POST /api/admin/invitations/[id]/status`.

### Jugador

- `POST /api/invitations/[token]/respond`.

### Integraciones

- `GET /api/whatsapp/webhook` para verificación.
- `POST /api/whatsapp/webhook` para estados.
- `GET /api/health` para salud.

## 13. WhatsApp

### Principio

WhatsApp inicia la interacción. La respuesta real se guarda en la aplicación.

### Plantilla prevista

Mensaje orientativo:

> Hola, {{1}}. Tienes una convocatoria para {{2}}, el {{3}}, en {{4}}. Pulsa el botón para consultar la información y responder.

Botón:

> Ver convocatoria

URL dinámica:

```text
https://dominio.com/i/{{1}}
```

El parámetro del botón será el token personal. El nombre y estructura exactos deben coincidir con la plantilla aprobada.

### Consentimiento

Guardar:

- Aceptación expresa.
- Texto o versión aceptada.
- Fecha y hora.
- Número.
- Retirada posterior.

No marcar la casilla por defecto.

## 14. Variables de entorno obligatorias

```dotenv
DATABASE_URL=
APP_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
CLUB_TIMEZONE=Europe/Madrid
CLUB_NAME=
WHATSAPP_MODE=mock
WHATSAPP_GRAPH_VERSION=v25.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_NAME=convocatoria_padel
WHATSAPP_TEMPLATE_LANGUAGE=es
```

## 15. Requisitos de producción

### Base de datos

- PostgreSQL administrado o servidor con copias de seguridad.
- TLS en conexiones externas.
- Usuario con permisos limitados.
- Copia diaria.
- Prueba de restauración.

### Aplicación

- HTTPS.
- Dominio propio.
- Variables secretas fuera del repositorio.
- Logs centralizados.
- Monitorización de `/api/health`.
- Reinicio automático.
- Separación entre producción y pruebas.

### Administrador

- Contraseña larga y hash bcrypt.
- Eliminar contraseña en texto plano.
- Añadir MFA antes de ampliar usuarios.

### WhatsApp

- Número específico o correctamente administrado.
- Token seguro y rotación.
- Plantilla aprobada.
- Webhook público.
- Prueba con números internos.
- Revisión de costes y calidad del número.

## 16. Despliegue

### Docker

```bash
cp .env.example .env
docker compose up --build -d
```

### Node.js

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm build
NODE_ENV=production pnpm start
```

### Vercel

- Repositorio Git.
- PostgreSQL externo.
- Variables de entorno.
- Migración ejecutada antes del tráfico.
- Prueba en preview.
- Promoción a producción.

## 17. Pruebas funcionales obligatorias

### Caso 1: partida con plazas

- Capacidad 4.
- Convocar 6 jugadores.
- Los cuatro primeros confirman.
- El quinto debe quedar en espera.
- No puede haber cinco confirmados.

### Caso 2: respuestas simultáneas

- Capacidad 1.
- Dos jugadores responden al mismo tiempo.
- Solo uno queda confirmado.
- El otro queda en espera.

### Caso 3: liga

- Convocar una plantilla.
- Tres jugadores disponibles.
- Dos no disponibles.
- Capitán selecciona hasta el máximo.
- No puede superar la capacidad.

### Caso 4: enlace inválido

- Token alterado.
- Debe mostrar página no encontrada.
- No se modifica la base.

### Caso 5: caducidad

- Fecha límite superada.
- La página informa del cierre.
- No admite una nueva respuesta.

### Caso 6: consentimiento

- Jugador sin consentimiento.
- No se envía WhatsApp automático.
- El panel informa del motivo.

### Caso 7: modo mock

- Se genera un mensaje `MOCKED`.
- Se puede abrir el enlace manual.
- No se llama a Meta.

### Caso 8: webhook

- Estado enviado, entregado, leído y fallido.
- Se actualiza el mensaje correspondiente.

## 18. Criterios de aceptación del MVP

- Compilación de producción sin errores.
- Lint sin errores.
- Esquema PostgreSQL instalable.
- Panel protegido.
- Alta de jugadores.
- Creación de convocatorias.
- Enlace personal operativo.
- Respuesta móvil operativa.
- Capacidad protegida por transacción.
- Lista de espera automática.
- Selección manual.
- Modo mock completo.
- Conector WhatsApp configurable.
- Webhook disponible.
- README de despliegue.
- Ningún secreto real incluido.

## 19. Fase 2 priorizada

1. Editar, cancelar y duplicar convocatorias.
2. Importar jugadores mediante CSV.
3. Grupos, equipos y temporadas.
4. Recordatorios programados.
5. Oferta automática de plaza a suplentes.
6. Mensajes de selección y no selección.
7. Roles de capitán.
8. Historial por jugador.
9. Exportación Excel o CSV.
10. Recuperación de acceso y MFA.
11. Rate limiting y protección CSRF adicional.
12. Cola de envíos y reintentos.
13. Pruebas automatizadas.

## 20. Fase 3

- Gestión de parejas.
- Resultados.
- Clasificaciones.
- Múltiples clubes.
- Pagos.
- Reservas de pista.
- PWA instalable con notificaciones.

## 21. Supuestos actuales

- Existe una única organización.
- Un administrador controla el piloto.
- Los jugadores tienen teléfono móvil.
- El club dispone del consentimiento o lo recogerá antes de enviar.
- La organización puede obtener una cuenta oficial de WhatsApp Business Platform.
- Los pagos no forman parte del piloto.
- La zona horaria principal es Europe/Madrid.

## 22. Riesgos

- Plantilla de WhatsApp no aprobada o con variables diferentes.
- Número bloqueado por uso inadecuado.
- Consentimiento insuficiente.
- Duplicados de teléfono.
- Cambios manuales no auditados fuera de la aplicación.
- Falta de proceso de sustitución.
- Contraseña administrativa compartida.
- Base de datos sin copia o restauración probada.
- Uso del piloto como sistema definitivo sin completar seguridad.

## 23. Definición de terminado para producción inicial

No considerar la plataforma lista para uso real hasta que se cumpla todo:

- Variables de producción configuradas.
- Contraseña administrativa con hash.
- HTTPS activo.
- PostgreSQL con copia de seguridad.
- Política de privacidad publicada.
- Consentimiento documentado.
- Plantilla y webhook probados.
- Pruebas de capacidad y concurrencia superadas.
- Prueba de baja y suplencia realizada.
- Monitorización configurada.
- Responsable operativo designado.
- Plan de respuesta ante fallo de WhatsApp.
- Revisión legal y de seguridad básica.

## 24. Orden de ejecución recomendado

1. Ejecutar el MVP en modo mock.
2. Probarlo con datos ficticios.
3. Ajustar campos y textos con el club.
4. Probar una partida interna.
5. Añadir jugadores reales con consentimiento.
6. Configurar WhatsApp en entorno de prueba.
7. Validar la plantilla.
8. Probar entrega, apertura y respuesta.
9. Realizar un piloto con una partida suelta.
10. Realizar un piloto con una jornada de liga.
11. Recoger incidencias.
12. Corregir seguridad y operación.
13. Autorizar producción.

## 25. Mandato para futuras modificaciones

Toda modificación debe:

- Mantener la fuente de verdad en PostgreSQL.
- Conservar el modo mock.
- No romper los enlaces existentes sin una estrategia de versión.
- Mantener reglas transaccionales de capacidad.
- Añadir validaciones y auditoría.
- Incluir migración de base de datos.
- Actualizar README y este documento.
- Superar lint y build.
- Probar móvil antes de fusionar.

