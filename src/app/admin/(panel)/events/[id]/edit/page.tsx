import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithInvitations } from "@/lib/repository";
import { utcToClubDateTimeInput } from "@/lib/time";
import { env } from "@/lib/env";

export default async function EditEventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; duplicated?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const detail = await getEventWithInvitations(id);
  if (!detail) notFound();
  const { event } = detail;
  return <main className="page"><div className="container"><p><Link href={`/admin/events/${id}`}>← Volver a la convocatoria</Link></p><h1>Editar convocatoria</h1>
    <p className="muted">Modifica los datos y la fecha. Los jugadores convocados se conservan.</p>
    {query.duplicated ? <div className="alert alert-success">Copia creada. Cambia la fecha antes de enviarla.</div> : null}
    {query.error ? <div className="alert alert-error">No se pudo guardar: {decodeURIComponent(query.error)}</div> : null}
    <form action={`/api/admin/events/${id}`} method="post" className="card form-grid">
      <div className="field field-full"><label htmlFor="title">Título</label><input id="title" name="title" defaultValue={event.title} required /></div>
      <div className="field"><label htmlFor="type">Tipo</label><select id="type" name="type" defaultValue={event.type}><option value="SINGLE_MATCH">Partida suelta</option><option value="LEAGUE_ROUND">Jornada de liga</option></select></div>
      <div className="field"><label htmlFor="responseMode">Modalidad</label><select id="responseMode" name="responseMode" defaultValue={event.responseMode}><option value="DIRECT">Inscripción directa</option><option value="AVAILABILITY">Declarar disponibilidad</option><option value="SELECTION">Disponibilidad y selección</option></select></div>
      <div className="field"><label htmlFor="startsAt">Inicio</label><input id="startsAt" name="startsAt" type="datetime-local" defaultValue={utcToClubDateTimeInput(event.startsAt)} required /></div>
      <div className="field"><label htmlFor="endsAt">Final</label><input id="endsAt" name="endsAt" type="datetime-local" defaultValue={utcToClubDateTimeInput(event.endsAt)} required /></div>
      <div className="field"><label htmlFor="deadlineAt">Límite de respuesta</label><input id="deadlineAt" name="deadlineAt" type="datetime-local" defaultValue={utcToClubDateTimeInput(event.deadlineAt)} required /></div>
      <div className="field"><label htmlFor="capacity">Plazas</label><input id="capacity" name="capacity" type="number" min="1" max="100" defaultValue={event.capacity} required /></div>
      <div className="field"><label htmlFor="venue">Club o sede</label><input id="venue" name="venue" defaultValue={event.venue} required /></div>
      <div className="field"><label htmlFor="address">Dirección</label><input id="address" name="address" defaultValue={event.address ?? ""} /></div>
      <div className="field"><label htmlFor="category">Categoría</label><input id="category" name="category" defaultValue={event.category ?? ""} /></div>
      <div className="field"><label htmlFor="priceNote">Precio informativo</label><input id="priceNote" name="priceNote" defaultValue={event.priceNote ?? ""} /></div>
      <div className="field field-full"><label htmlFor="description">Descripción o indicaciones</label><textarea id="description" name="description" defaultValue={event.description ?? ""} /></div>
      <div className="field-full actions"><button className="button button-primary" type="submit" disabled={env.DEMO_MODE}>Guardar cambios</button><Link className="button button-secondary" href={`/admin/events/${id}`}>Cancelar</Link></div>
    </form>
  </div></main>;
}
