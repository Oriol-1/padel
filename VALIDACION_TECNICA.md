# Validación técnica de la entrega

Fecha: 14 de julio de 2026

## Comprobaciones superadas

- `pnpm lint`: superado sin errores.
- `pnpm build`: compilación de producción superada.
- Servidor de producción: la página de inicio respondió HTTP 200.
- Esquema SQL: aplicado correctamente en una instancia embebida compatible con PostgreSQL mediante PGlite.
- Inserción básica: jugador, evento e invitación creados correctamente durante la prueba del esquema.
- Conversión horaria Europe/Madrid:
  - 15/07/2026 19:00 se convierte a 17:00 UTC.
  - 15/12/2026 19:00 se convierte a 18:00 UTC.
- Archivo comprimido: no incluye `.env`, `node_modules` ni compilaciones locales.

## Comprobaciones pendientes en la infraestructura del usuario

- Ejecución completa contra PostgreSQL real.
- Construcción del contenedor Docker, ya que Docker no estaba disponible en el entorno de validación.
- Envío real mediante WhatsApp Business Platform.
- Aprobación y correspondencia exacta de la plantilla de Meta.
- Recepción de webhooks desde Meta.
- Prueba de concurrencia con tráfico real.
- Revisión legal de consentimiento y privacidad.

## Recomendación

Realizar primero el piloto con `WHATSAPP_MODE=mock`. No activar `live` hasta completar las pruebas de base de datos, plantilla, webhook y consentimiento en un entorno de preproducción.
