import Link from 'next/link';

export default function AdminPage() {
  return (
    <section className="min-h-[calc(100vh-5rem)] px-5 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4">
          Panel de administración
        </p>
        <h1 className="font-anton text-5xl md:text-7xl leading-none mb-6">
          ADMIN
          <br />
          SHINSEIKAN
        </h1>
        <p className="text-white/75 text-lg max-w-2xl mb-10">
          Desde esta ruta podés volver al panel de contenido y edición del sitio.
          En producción, esta página evita el 404 y sirve como acceso directo al
          área administrativa.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
              Sitio público
            </div>
            <div className="text-2xl font-bold">Volver al inicio</div>
          </Link>

          <a
            href="/admin/"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
              Ruta actual
            </div>
            <div className="text-2xl font-bold">/admin</div>
          </a>
        </div>

        <div className="mt-10 rounded-3xl border border-primary/20 bg-primary/10 p-6">
          <p className="text-sm text-white/80">
            Si querés que esta ruta muestre el panel admin completo dentro de
            Next, el siguiente paso es migrar la interfaz antigua a una página
            React dentro de `app/admin`.
          </p>
        </div>
      </div>
    </section>
  );
}
