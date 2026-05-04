'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  horarios: string[];
  ubicacion: string;
  referente?: string;
}

export default function ContactoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);

  const sedes: Sede[] = [
    {
      id: 1,
      nombre: 'DOJO CENTRAL',
      direccion: 'Carlos Tejedor 1165, B° San Vicente, Córdoba',
      telefono: '351 674-2868',
      whatsapp: '351 674-2868',
      horarios: ['Martes y Jueves: Karate-Do', 'Viernes: Kobudo', 'Sábado: Aikido y Defensa Personal'],
      ubicacion: 'Google Maps (pendiente)',
      referente: 'Sensei Alejandro Peralta',
    },
  ];

  const handleSelectSede = (sede: Sede) => {
    setSelectedSede(sede);
    setModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-anton text-6xl md:text-7xl text-primary leading-none mb-6">
            CONTACTO
            <br />
            SHINSEIKAN
          </h1>
          <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
            Escribinos y coordinamos tu clase de prueba. Te respondemos por WhatsApp.
          </p>
        </div>

        {/* Sedes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sedes.map((sede) => (
            <div
              key={sede.id}
              className="bg-card border border-border p-6 hover:border-primary transition"
            >
              <h3 className="font-anton text-2xl text-primary mb-4">{sede.nombre}</h3>

              <div className="space-y-4 mb-6 text-sm text-white opacity-90">
                <div>
                  <p className="font-bold mb-1">📍 Dirección</p>
                  <p>{sede.direccion}</p>
                </div>

                <div>
                  <p className="font-bold mb-1">📞 Teléfono</p>
                  <p>{sede.telefono}</p>
                </div>

                <div>
                  <p className="font-bold mb-1">💬 WhatsApp</p>
                  <p>{sede.whatsapp}</p>
                </div>

                <div>
                  <p className="font-bold mb-2">🕐 Horarios</p>
                  {sede.horarios.map((horario, idx) => (
                    <p key={idx} className="text-xs">
                      {horario}
                    </p>
                  ))}
                </div>

                {sede.referente && (
                  <div>
                    <p className="font-bold mb-1">🥋 Referente</p>
                    <p>{sede.referente}</p>
                  </div>
                )}
              </div>

              <button onClick={() => handleSelectSede(sede)} className="btn btn-primary w-full">
                CONTACTAR →
              </button>
            </div>
          ))}
        </div>

        {/* Formulario General de Contacto */}
        <div className="bg-card border border-border p-8 mb-16">
          <h3 className="font-anton text-3xl text-primary mb-8">FORMULARIO DE CONTACTO</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('¡Tu mensaje fue enviado! Te contactaremos pronto.');
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                placeholder="NOMBRE COMPLETO"
                className="bg-black border border-border text-white p-4 text-sm font-bold focus:outline-none focus:border-primary"
                required
              />
              <input
                type="tel"
                placeholder="WHATSAPP"
                className="bg-black border border-border text-white p-4 text-sm font-bold focus:outline-none focus:border-primary"
                required
              />
            </div>

            <select
              className="w-full bg-black border border-border text-white p-4 text-sm font-bold mb-6 focus:outline-none focus:border-primary"
              required
            >
              <option value="">¿CUÁL ES TU CONSULTA?</option>
              <option value="clases">Clases</option>
              <option value="inscripcion">Inscripción</option>
              <option value="horarios">Horarios</option>
              <option value="otros">Otros</option>
            </select>

            <textarea
              placeholder="MENSAJE"
              rows={5}
              className="w-full bg-black border border-border text-white p-4 text-sm font-bold mb-6 focus:outline-none focus:border-primary"
              required
            ></textarea>

            <button type="submit" className="btn btn-primary w-full">
              ENVIAR MENSAJE →
            </button>
          </form>
        </div>

        {/* Información de Contacto General */}
        <div className="bg-primary/10 border border-primary p-8">
          <h3 className="font-anton text-3xl text-primary mb-8">CONTACTO GENERAL</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="font-bold text-white mb-4">📞 Teléfono</h4>
              <p className="text-white text-lg mb-6">351 674-2868</p>

              <h4 className="font-bold text-white mb-4">💬 WhatsApp</h4>
              <p className="text-white text-lg mb-6">351 674-2868</p>

              <h4 className="font-bold text-white mb-4">📍 Dirección</h4>
              <p className="text-white">Carlos Tejedor 1165, B° San Vicente, Córdoba</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Referente</h4>
              <p className="text-white opacity-90 mb-6">Sensei Alejandro Peralta</p>

              <h4 className="font-bold text-white mb-4">Redes Sociales</h4>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/shinseikanoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white hover:text-primary transition"
                >
                  📷 Instagram: @shinseikanoficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedSede && (
          <>
            <h3 className="font-anton text-primary text-3xl mb-4">{selectedSede.nombre}</h3>
            <div className="mb-6 space-y-3 text-white text-sm">
              <div>
                <p className="font-bold">📍 {selectedSede.direccion}</p>
              </div>
              <div>
                <p className="font-bold">📞 {selectedSede.telefono}</p>
              </div>
              {selectedSede.referente && (
                <div>
                  <p className="font-bold">🥋 {selectedSede.referente}</p>
                </div>
              )}
              <div>
                <p className="font-bold mb-2">🕐 Horarios</p>
                {selectedSede.horarios.map((h, i) => (
                  <p key={i} className="opacity-75">
                    {h}
                  </p>
                ))}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`¡Solicitud enviada! Te contactaremos pronto desde ${selectedSede.nombre}.`);
                setModalOpen(false);
              }}
            >
              <input
                type="text"
                placeholder="NOMBRE"
                className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-4 text-sm font-bold"
                required
              />
              <input
                type="tel"
                placeholder="WHATSAPP"
                className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-6 text-sm font-bold"
                required
              />
              <button type="submit" className="btn btn-primary w-full">
                CONTACTAR →
              </button>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}

