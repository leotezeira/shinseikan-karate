import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-border">
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Logo */}
        <div className="border-4 border-primary text-primary font-anton text-xl px-4 py-2 mb-12 inline-block">
          SHINSEIKAN
          <br />
          KARATE
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Dojo */}
          <div>
            <h3 className="font-anton text-primary text-xl mb-6 tracking-widest">DOJO</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/contacto"
                  className="text-white text-sm opacity-80 hover:opacity-100 hover:text-primary transition"
                >
                  Dojo Central
                </Link>
              </li>
              <li>
                <Link
                  href="/clases"
                  className="text-white text-sm opacity-80 hover:opacity-100 hover:text-primary transition"
                >
                  Clases y Horarios
                </Link>
              </li>
              <li>
                <Link
                  href="/inscripciones"
                  className="text-white text-sm opacity-80 hover:opacity-100 hover:text-primary transition"
                >
                  Inscripciones
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-white text-sm opacity-80 hover:opacity-100 hover:text-primary transition"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Disciplina */}
          <div>
            <h3 className="font-anton text-primary text-xl mb-6 tracking-widest">DISCIPLINAS</h3>
            <ul className="space-y-4">
              <li className="text-white text-sm opacity-80">Karate-Do</li>
              <li className="text-white text-sm opacity-80">Kobudo</li>
              <li className="text-white text-sm opacity-80">Aikido</li>
              <li className="text-white text-sm opacity-80">Defensa Personal</li>
            </ul>
          </div>

          {/* Column 3: Contacto */}
          <div>
            <h3 className="font-anton text-primary text-xl mb-6 tracking-widest">CONTACTO</h3>
            <ul className="space-y-4">
              <li className="text-white text-sm opacity-80">Carlos Tejedor 1165 · B° San Vicente · Córdoba</li>
              <li className="text-white text-sm opacity-80">WhatsApp: 351 674-2868</li>
              <li>
                <a
                  href="https://instagram.com/shinseikanoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm opacity-80 hover:opacity-100 hover:text-primary transition"
                >
                  Instagram: @shinseikanoficial
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-border pt-6 mb-6">
          <p className="text-gray-600 text-xs font-bold mb-4">© 2026 SHINSEIKAN KARATE</p>
          <div className="flex flex-wrap gap-6 mb-6">
            <Link href="#" className="text-primary text-xs font-bold hover:underline">
              REGLAMENTO DEL DOJO
            </Link>
            <Link href="#" className="text-primary text-xs font-bold hover:underline">
              TÉRMINOS Y CONDICIONES
            </Link>
            <Link href="#" className="text-primary text-xs font-bold hover:underline">
              POLÍTICA DE PRIVACIDAD
            </Link>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-8 py-6 border-t border-b border-border mb-6">
          <a
            href="https://instagram.com/shinseikanoficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary transition text-2xl"
          >
            📷
          </a>
        </div>

        {/* Bottom */}
        <div className="text-center">
          <a href="#" className="text-gray-600 text-xs font-bold hover:text-primary">
            shinseikan.com
          </a>
        </div>
      </div>
    </footer>
  );
}

