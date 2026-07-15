# Plan multi-organizacion con coste cero y sin tarjeta

Fecha de revision: 15 de julio de 2026.

## 1. Objetivo

Evolucionar el MVP actual hacia una plataforma multi-organizacion capaz de gestionar clubes, equipos y grupos de padel independientes, manteniendo estas restricciones:

- Coste mensual inicial y objetivo: 0 EUR.
- Unico gasto aceptable: dominio anual.
- Sin tarjeta bancaria para activar infraestructura.
- Sin servidor, PC, NAS o dispositivo propio.
- Objetivo inicial: 50 organizaciones.
- Objetivo inicial: 10.000 usuarios registrados.
- Uso principalmente movil.
- Acceso mediante codigo enviado por correo.
- WhatsApp mediante compartir manual, sin API automatica.
- Datos exportables y arquitectura migrable.
- Ningun servicio podra activar facturacion automatica.

Los limites gratuitos y condiciones comerciales pueden cambiar. Antes de cada despliegue se deberan volver a comprobar en la documentacion oficial.

## 2. Conclusiones de viabilidad

No existe una infraestructura gratuita, sin tarjeta y con SLA que garantice indefinidamente 50 clubes, 10.000 usuarios, alta disponibilidad y almacenamiento ilimitado.

Si es viable construir un sistema de buena calidad para 10.000 usuarios registrados y una concurrencia moderada si se aplican limites, almacenamiento controlado, una PWA estatica y una API muy ligera.

El objetivo no incluye 10.000 usuarios simultaneos. El escenario previsto es:

- 50 organizaciones.
- 200 jugadores de media por organizacion.
- 100 a 300 usuarios concurrentes en picos.
- Menos de 50.000 peticiones API diarias normalmente.
- Limite tecnico de 100.000 peticiones API diarias.
- Maximo de 5 GB de datos activos.
- Maximo de 300 correos diarios.

La plataforma no ofrecera SLA mientras opere exclusivamente sobre niveles gratuitos.

## 3. Arquitectura seleccionada

```text
Navegador / PWA movil
        |
        v
Cloudflare Static Assets
        |
        v
Cloudflare Worker API
Hono + TypeScript + Zod
        |
        v
Turso / libSQL
Base global + base por organizacion
        |
        +-- Brevo SMTP
        +-- Web Push
        +-- Google Drive cifrado para backups
```

### Componentes

| Componente | Tecnologia o servicio | Cuota gratuita relevante |
|---|---|---:|
| Frontend | React, Vite y PWA | Codigo abierto |
| Alojamiento frontend | Cloudflare Static Assets | Peticiones estaticas gratuitas |
| API | Cloudflare Workers | 100.000 peticiones por dia |
| Framework API | Hono | MIT y portable |
| Base de datos | Turso/libSQL | 5 GB totales |
| Lecturas | Turso Free | 500 millones de filas al mes |
| Escrituras | Turso Free | 10 millones de filas al mes |
| Bases | Turso Free | 100 bases |
| Recuperacion | Turso Free | 1 dia de restauracion puntual |
| Correo | Brevo Free | 300 correos al dia |
| Antibot | Cloudflare Turnstile | Desafios gratuitos |
| CI/CD | GitHub Actions | 2.000 minutos mensuales en privado |
| Backup externo | Google Drive | 15 GB |
| Notificaciones | Web Push | Sin coste por mensaje |
| WhatsApp | Web Share API y `wa.me` | Sin API automatica |

Cloudflare R2 queda excluido porque requiere completar un checkout para activar la suscripcion, aunque exista una cuota gratuita.

## 4. Motivos de la seleccion

### Turso

Turso declara que el plan gratuito no requiere tarjeta y ofrece una capacidad superior a las alternativas PostgreSQL gratuitas disponibles:

- 5 GB de almacenamiento.
- 100 bases de datos.
- 500 millones de filas leidas mensualmente.
- 10 millones de filas escritas mensualmente.
- Un dia de recuperacion a un punto anterior.
- Exportacion y compatibilidad con SQLite/libSQL.

### Cloudflare Workers

Workers permite ejecutar una API global con limites duros y sin activar facturacion:

- 100.000 peticiones dinamicas diarias.
- 10 ms de CPU por peticion.
- 128 MB de memoria por isolate.
- 50 subpeticiones externas por peticion.
- Los archivos estaticos no consumen la cuota de peticiones dinamicas.

El limite de CPU impide ejecutar el Next.js actual completo con SSR. Por ello la arquitectura objetivo separa una PWA estatica y una API ligera.

### Alternativas descartadas

| Alternativa | Motivo principal |
|---|---|
| Oracle Always Free | Requiere normalmente tarjeta de verificacion |
| Vercel Hobby | Destinado oficialmente a uso personal y no comercial |
| Render Free | Recursos limitados y PostgreSQL gratuito temporal |
| Neon Free | Solo 0,5 GB y 100 CU-horas |
| Supabase Free | Solo 500 MB de base de datos |
| Cloudflare D1 como principal | Mayor dependencia de proveedor y menor portabilidad que libSQL |
| Deno Deploy | Menor cuota de peticiones y almacenamiento para este caso |
| Firebase | Dependencia elevada y cambio completo de modelo de datos |

## 5. Modelo de aislamiento

Se utilizara una base fisica por organizacion:

```text
platform.db
club-001.db
club-002.db
...
club-050.db
```

Esta estrategia utiliza 51 de las 100 bases gratuitas disponibles.

### Ventajas

- Una consulta del Club A no puede devolver filas del Club B.
- Un fallo SQL queda limitado a una organizacion.
- Cada organizacion puede exportarse y restaurarse por separado.
- Es posible borrar o migrar un club sin exportar toda la plataforma.
- El consumo puede medirse individualmente.
- Se reduce el impacto de no disponer de PostgreSQL Row-Level Security.

Todas las tablas tenant incluiran igualmente `organization_id` como defensa adicional y para facilitar una futura migracion a PostgreSQL.

## 6. Base global

`platform.db` almacenara exclusivamente identidad, acceso y control de plataforma:

- `users`.
- `sessions`.
- `email_login_codes`.
- `organizations`.
- `organization_memberships`.
- `organization_roles`.
- `permissions`.
- `organization_role_permissions`.
- `organization_invitations`.
- `tenant_database_registry`.
- `platform_administrators`.
- `support_access_grants`.
- `security_events`.
- `usage_counters`.
- `tenant_schema_versions`.
- `distributed_operations`.

No almacenara plantillas completas, equipos, partidas ni resultados deportivos.

## 7. Base de cada organizacion

Cada base tenant almacenara:

- Configuracion y branding.
- Jugadores de la organizacion.
- Equipos.
- Titulares, suplentes y capitanes.
- Ligas y competiciones.
- Sedes y pistas.
- Partidas y jornadas.
- Jugadores convocados.
- Disponibilidad y confirmaciones.
- Listas de espera.
- Resultados.
- Notificaciones internas.
- Suscripciones Web Push.
- Auditoria de la organizacion.
- Estadisticas agregadas.

## 8. Resolucion segura de organizacion

Las rutas canonicas utilizaran un slug:

```text
/o/[organizationSlug]/dashboard
/o/[organizationSlug]/players
/o/[organizationSlug]/teams
/o/[organizationSlug]/events
/api/o/[organizationSlug]/...
```

Cada peticion seguira este flujo:

1. Validar la sesion.
2. Resolver el slug en `platform.db`.
3. Comprobar que la organizacion esta activa.
4. Comprobar la membresia del usuario.
5. Comprobar rol y permiso.
6. Resolver internamente la base tenant.
7. Crear un `TenantContext` inmutable.
8. Ejecutar el repositorio tenant.
9. Registrar la accion cuando sea relevante.

El cliente nunca podra proporcionar:

- La URL de Turso.
- El nombre interno de la base.
- Tokens de acceso a bases.
- Su propio rol.
- Sus permisos.
- Un `organization_id` como prueba de autorizacion.

## 9. Contexto tenant

```ts
type TenantContext = {
  organizationId: string;
  tenantDatabaseId: string;
  userId: string;
  membershipId: string;
  role: OrganizationRole;
  permissions: Permission[];
  requestId: string;
};
```

Todos los repositorios de negocio exigiran este contexto. No existiran funciones administrativas con tenant opcional.

## 10. Roles y permisos

Roles iniciales:

| Rol | Alcance |
|---|---|
| `OWNER` | Control completo de su organizacion |
| `ADMIN` | Gestion general sin transferir propiedad |
| `CAPTAIN` | Equipos y convocatorias asignadas |
| `MANAGER` | Operacion deportiva limitada |
| `VIEWER` | Informes y consulta |
| `PLAYER` | Area personal y respuestas |

Permisos iniciales:

```text
organization.manage
members.invite
members.disable
roles.manage
players.read
players.write
teams.read
teams.write
events.read
events.create
events.manage
notifications.send
reports.read
audit.read
```

La autorizacion comprobara permisos, no unicamente nombres de roles.

## 11. Usuarios en varias organizaciones

La cuenta de usuario sera global y las membresias estaran en `platform.db`.

Al iniciar sesion:

- Una organizacion activa: acceso directo.
- Varias organizaciones: selector de espacio.
- Ninguna organizacion: mostrar invitaciones pendientes u onboarding.

Para obtener proximos partidos de varias organizaciones:

1. Obtener las membresias activas.
2. Consultar como maximo cinco bases tenant en paralelo.
3. Combinar resultados en memoria.
4. Ordenar por fecha.
5. Mostrar siempre la organizacion de cada partido.
6. Paginar organizaciones si el usuario pertenece a mas de cinco.

No se copiaran todas las partidas a la base global.

## 12. Administracion de plataforma

El administrador general trabajara normalmente sobre `platform.db` y estadisticas agregadas.

Podra:

- Consultar organizaciones y estado.
- Activar o suspender espacios.
- Consultar consumo y cuotas.
- Gestionar incidencias.
- Revisar eventos de seguridad.
- Gestionar planes futuros.

El acceso a datos internos requerira una concesion temporal:

- Organizacion concreta.
- Motivo.
- Ticket o incidencia.
- Duracion.
- Permisos limitados.
- Registro de todas las acciones.
- Caducidad automatica.

## 13. Frontend PWA

El frontend objetivo sera una PWA estatica:

- React.
- TypeScript.
- Vite.
- React Router.
- Service Worker.
- Caché local controlada.
- Web Push.
- Instalacion en Android e iOS.
- Modo offline parcial.
- Reutilizacion del sistema visual actual.

El frontend no accedera directamente a Turso. Toda lectura o escritura pasara por la API.

## 14. API portable

La API utilizara:

- Hono.
- TypeScript.
- Zod.
- Drizzle con libSQL.
- Contratos compartidos con el frontend.
- Adaptadores para servicios externos.

Hono permite mover la API a Workers, Deno, Node.js o un contenedor.

Interfaces obligatorias:

```ts
interface TenantDatabase {
  execute(query: Query): Promise<Result>;
  transaction<T>(callback: TransactionCallback<T>): Promise<T>;
}

interface MailProvider {
  send(message: MailMessage): Promise<DeliveryResult>;
}

interface ChallengeProvider {
  verify(token: string): Promise<boolean>;
}
```

## 15. Estructura objetivo

```text
apps/
  web/
    src/
      routes/
      features/
      components/
      api/
      pwa/
  api/
    src/
      routes/
      middleware/
      jobs/
      adapters/

packages/
  domain/
    organizations/
    memberships/
    players/
    teams/
    events/
    leagues/
    notifications/
    audit/
  contracts/
  database/
    global/
    tenant/
    repositories/
    adapters/
  auth/
  ui/
  testing/

scripts/
  provision-tenant.ts
  migrate-tenants.ts
  backup-tenants.ts
  restore-tenant.ts
  verify-isolation.ts

tests/
  unit/
  integration/
  tenant-isolation/
  security/
  e2e/
  load/
```

## 16. Autenticacion por correo

El acceso utilizara codigos temporales enviados por Brevo.

Flujo:

1. El usuario introduce su correo.
2. Se valida Turnstile.
3. Se comprueba rate limiting.
4. Se genera un codigo criptografico.
5. Solo se almacena su hash.
6. El codigo caduca en diez minutos.
7. Se envia mediante Brevo.
8. Se permiten como maximo cinco intentos.
9. El codigo se invalida tras utilizarse.
10. Se crea una sesion persistente.

La sesion tendra:

- Cookie `HttpOnly`.
- `Secure`.
- `SameSite=Lax`.
- Token aleatorio de 256 bits.
- Solo hash almacenado.
- Caducidad aproximada de 30 dias.
- Rotacion y revocacion individual.

El codigo se solicitara al iniciar una nueva sesion o dispositivo, no en cada carga de pagina.

## 17. Proteccion de la cuota de correo

Brevo permite 300 correos diarios.

Medidas:

- Un codigo por correo cada 60 segundos.
- Maximo cinco codigos por hora.
- Maximo diario por identidad e IP.
- Sesiones persistentes.
- Web Push para convocatorias.
- Enlaces privados para jugadores.
- Correo reservado para login, alta y seguridad.

## 18. Acceso de jugadores

Los jugadores responderan mediante enlaces privados:

- Token opaco aleatorio.
- Solo hash almacenado.
- Organizacion e invitacion vinculadas.
- Caducidad.
- Uso unico cuando corresponda.
- Version para revocacion.
- Intercambio por sesion persistente de jugador.

Esto evita enviar un codigo de correo para cada convocatoria.

## 19. WhatsApp sin coste

La plataforma no enviara WhatsApp automaticamente.

Flujo:

1. Generar mensaje y enlace personal.
2. Pulsar `Compartir por WhatsApp`.
3. Abrir `wa.me` o Web Share API.
4. El administrador confirma el envio desde su dispositivo.

No seran necesarios tokens de Meta, plantillas, webhooks ni facturacion de WhatsApp.

## 20. Web Push

Web Push sera el canal automatico gratuito para:

- Nueva convocatoria.
- Recordatorio.
- Seleccion.
- Cambio de horario o pista.
- Cancelacion.
- Resultado.

Se utilizaran VAPID, Service Worker, consentimiento explicito y limpieza de suscripciones caducadas.

En iPhone sera necesario instalar la PWA para recibir notificaciones.

## 21. Presupuesto de peticiones

Objetivo normal: menos de 50.000 peticiones API diarias.

| Uso | Presupuesto diario |
|---|---:|
| Dashboard y panel | 5.000 |
| Listados | 8.000 |
| Invitaciones | 15.000 |
| Respuestas | 10.000 |
| Area personal | 15.000 |
| Notificaciones | 10.000 |
| Administracion | 5.000 |
| Margen compartido | 32.000 |

El presupuesto superior representa picos alternativos, no la suma simultanea de todos los maximos.

Para reducir peticiones:

- Un endpoint agregado por pantalla.
- Sin polling.
- Web Push para cambios.
- Paginacion.
- ETags.
- Caché PWA.
- Respuestas comprimidas.
- Estadisticas precalculadas.
- Nada de telemetria por cada interaccion.

## 22. Presupuesto de CPU

Workers Free permite 10 ms de CPU por peticion.

Objetivos:

```text
CPU p95 < 7 ms
CPU p99 < 9 ms
```

Quedaran fuera de las peticiones web:

- SSR dinamico.
- Hashing Argon2.
- Generacion de PDF.
- Procesamiento de imagenes.
- Compresion de backups.
- Informes pesados.
- Migraciones.

## 23. Presupuesto de almacenamiento

Distribucion de los 5 GB de Turso:

| Uso | Presupuesto |
|---|---:|
| Base global | 300 MB |
| 50 organizaciones | 4.000 MB |
| Reserva | 700 MB |
| Media por organizacion | 80 MB |

Cuotas iniciales por organizacion:

| Recurso | Limite |
|---|---:|
| Administradores | 5 |
| Jugadores | 300 |
| Equipos | 20 |
| Partidas anuales | 500 |
| Invitaciones activas | 5.000 |
| Logotipo | 150 KB |
| Auditoria online | 12 meses |
| Entregas Push | 90 dias |
| Archivos adjuntos | No incluidos |

## 24. Retencion

- Partidas completas: 24 meses.
- Despues de 24 meses: conservar resumen y resultado.
- Auditoria detallada: 12 meses.
- Entregas de notificacion: 90 dias.
- Codigos de correo: 24 horas como maximo.
- Sesiones revocadas: 90 dias.
- Tokens usados: eliminacion tras la ventana de seguridad.
- No guardar cuerpos completos de correos.
- No guardar enlaces personales en logs.
- Estadisticas antiguas mediante agregados.

## 25. Backups sin tarjeta

Protecciones:

- Recuperacion puntual de Turso durante un dia.
- Exportacion nocturna de bases modificadas.
- Exportacion completa semanal.
- Compresion con Zstandard.
- Cifrado con `age`.
- Subida directa a Google Drive con `rclone`.
- Checksum y verificacion automatica.

Retencion:

| Copia | Retencion |
|---|---:|
| Nocturna modificada | 7 dias |
| Semanal completa | 8 semanas |
| Mensual completa | 6 meses |
| Previa a migracion | Hasta validar despliegue |

Mensualmente se restauraran la base global, una organizacion aleatoria y la organizacion de mayor tamaño.

Los datos no se guardaran en artefactos publicos de GitHub.

## 26. Migraciones multi-base

Cada base incluira `schema_migrations` y `organization_metadata`.

Proceso:

1. Migrar base de pruebas.
2. Ejecutar pruebas.
3. Migrar organizacion demo.
4. Migrar cinco organizaciones piloto.
5. Observar errores.
6. Migrar el resto en lotes de diez.
7. Registrar el resultado global.
8. Reintentar las fallidas.
9. No retirar compatibilidad hasta completar todas las bases.

Las migraciones nunca se ejecutaran desde una peticion web.

## 27. Operaciones entre bases

No hay transacciones distribuidas entre `platform.db` y una base tenant.

Se utilizara una saga idempotente:

```text
Crear operacion pendiente en platform.db
        |
        v
Aplicar operacion en tenant.db
        |
        v
Confirmar estado global
        |
        v
Marcar operacion completada
```

Cada operacion tendra ID, estado, reintentos, error, accion compensatoria y clave de idempotencia.

## 28. Administracion de consumo

Alertas:

| Recurso | Niveles |
|---|---|
| Workers | 50 %, 75 %, 90 % |
| Turso storage | 60 %, 75 %, 85 % |
| Turso lecturas | 60 %, 80 %, 90 % |
| Turso escrituras | 60 %, 80 %, 90 % |
| Brevo | 50 %, 80 %, 95 % |
| GitHub Actions | 50 %, 80 %, 90 % |
| Google Drive | 60 %, 80 %, 90 % |

Al acercarse al limite:

1. Desactivar estadisticas no esenciales.
2. Aumentar caché local.
3. Reducir refrescos.
4. Posponer informes.
5. Bloquear archivos.
6. Mantener autenticacion, convocatorias y respuestas.

Ningun limite activara automaticamente un plan de pago.

## 29. CI/CD

Pipeline:

1. Instalar dependencias.
2. Ejecutar lint.
3. Ejecutar pruebas unitarias.
4. Crear bases libSQL de prueba.
5. Ejecutar migraciones.
6. Ejecutar pruebas de aislamiento.
7. Ejecutar E2E criticos.
8. Construir PWA y Worker.
9. Desplegar preview.
10. Desplegar produccion tras validacion.
11. Ejecutar migraciones por lotes.
12. Comprobar healthcheck.

Para proteger los 2.000 minutos gratuitos:

- Solo runners Linux.
- Caché de pnpm.
- E2E completos solo en `main`.
- Retencion corta de artefactos.
- Cancelacion de ejecuciones obsoletas.

## 30. Fases de desarrollo

### Fase 0. Prueba de viabilidad

Duracion: 1 a 2 semanas.

- Crear cuentas sin tarjeta.
- Desplegar PWA minima.
- Desplegar Worker minimo.
- Conectar Turso.
- Probar Brevo y Turnstile.
- Medir CPU y latencia.
- Probar exportacion y restauracion.
- Simular 300 usuarios concurrentes.

Criterios de salida:

```text
CPU p95 < 7 ms
Errores < 1 %
API p95 < 700 ms
Backup restaurable
Ninguna tarjeta solicitada
Ningun producto de pago activado
```

Si esta fase falla, se detendra la migracion completa.

### Fase 1. Monorepo y PWA

Duracion: 3 a 4 semanas.

- Crear `apps/web` y `apps/api`.
- Extraer componentes visuales actuales.
- Configurar PWA.
- Definir contratos API.
- Mantener temporalmente el MVP actual.

### Fase 2. Identidad global

Duracion: 3 a 4 semanas.

- Usuarios.
- Codigos por correo.
- Sesiones.
- Turnstile.
- Rate limiting.
- Organizaciones.
- Membresias.
- Roles y permisos.
- Selector de organizacion.

### Fase 3. Bases por organizacion

Duracion: 3 a 4 semanas.

- Provisionamiento tenant.
- Registro de bases.
- Migraciones multi-base.
- Contexto tenant.
- Repositorios.
- Pruebas de aislamiento.
- Backups individuales.

### Fase 4. Migracion del MVP

Duracion: 4 a 6 semanas.

- Organizacion legacy.
- Jugadores.
- Partidas.
- Invitaciones.
- Respuestas.
- Lista de espera.
- Auditoria.
- Sesiones de jugador.
- Compatibilidad temporal con enlaces actuales.

### Fase 5. Equipos y ligas

Duracion: 4 a 6 semanas.

- Equipos.
- Capitanes.
- Suplentes.
- Ligas.
- Pistas.
- Resultados.
- Buscadores.

### Fase 6. Notificaciones

Duracion: 2 a 3 semanas.

- Web Push.
- Bandeja interna.
- Preferencias.
- Compartir por WhatsApp.
- Reintentos y limpieza.

### Fase 7. Administracion de plataforma

Duracion: 2 a 3 semanas.

- Organizaciones.
- Bloqueos.
- Cuotas.
- Estadisticas.
- Incidencias.
- Acceso temporal de soporte.

### Fase 8. Operacion y seguridad

Duracion: 3 a 4 semanas.

- Backups.
- Restauracion.
- Retencion.
- Pruebas de carga.
- Pruebas IDOR.
- Rotacion de secretos.
- Exportacion y eliminacion GDPR.
- Documentacion.

Estimacion total para un desarrollador: 24 a 34 semanas.

## 31. Pruebas obligatorias

- Club A no puede resolver la base del Club B.
- Una sesion de A no funciona en B.
- Un ID de B consultado desde A devuelve 404.
- Un administrador suspendido pierde acceso.
- Cambiar de organizacion elimina el contexto anterior.
- Un codigo de correo solo funciona una vez.
- Un codigo caducado es rechazado.
- Turnstile invalido es rechazado.
- Un token de invitacion de A no funciona en B.
- Una operacion incompleta se reconcilia.
- Una migracion fallida no bloquea otros tenants.
- Una organizacion se exporta y restaura independientemente.
- El backup global permite reconstruir el registro de tenants.
- 300 usuarios concurrentes no superan los limites.
- El sistema degrada antes de agotar la cuota diaria.

## 32. Migracion futura

Si se superan 100 organizaciones, 5 GB o 100.000 peticiones diarias, la arquitectura permitira migrar:

- PWA estatica a cualquier CDN.
- API Hono a Node.js, Deno o contenedor.
- Turso/libSQL a libSQL autohospedado.
- Datos tenant a PostgreSQL.
- Correo a cualquier SMTP.
- Turnstile a otro proveedor mediante adaptador.

La migracion a PostgreSQL exigira reintroducir `organization_id`, constraints compuestas y Row-Level Security, pero los dominios y contratos de aplicacion no cambiaran.

## 33. Condiciones para iniciar el desarrollo completo

La Fase 0 debe demostrar:

- Registro en todos los servicios sin tarjeta.
- CPU de Worker suficiente.
- Latencia aceptable de Turso.
- Exportacion automatizable.
- Restauracion comprobada.
- Brevo operativo con el dominio.
- Turnstile operativo.
- Carga de 300 usuarios concurrentes.
- Consumo proyectado dentro de cuotas.

No se habilitara una segunda organizacion real antes de superar las pruebas de aislamiento.

## 34. Fuentes oficiales

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/plans/
- Turso pricing: https://turso.tech/pricing
- Brevo pricing: https://www.brevo.com/pricing/
- GitHub Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Web Push overview: https://web.dev/articles/push-notifications-overview

## 35. Decision final

La arquitectura aprobada para validar es:

```text
React + Vite + PWA
Cloudflare Static Assets
Cloudflare Workers
Hono
Turso/libSQL
Una base por organizacion
Brevo SMTP
Cloudflare Turnstile
Web Push
WhatsApp manual
GitHub Actions
Google Drive cifrado
```

Es la combinacion analizada que mejor equilibra coste cero, ausencia de tarjeta, aislamiento, capacidad inicial, experiencia movil y posibilidad de migracion.
