'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface Clase {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: string;
  edad: string;
  dias: string;
  horarios: string;
  imagen: string;
}

export default function ClasesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Clase | null>(null);

  const clases: Clase[] = [
    {
      id: 1,
      nombre: 'KARATE-DO',
      descripcion:
        'Karate tradicional: kihon, kata y kumite con enfoque en disciplina, técnica y superación personal.',
      nivel: 'Todos',
      edad: 'Desde 5 años',
      dias: 'Martes y Jueves',
      horarios: '16:00 - 17:00',
      imagen: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=600',
    },
    {
      id: 2,
      nombre: 'KOBUDO',
      descripcion:
        'Entrenamiento con armas tradicionales: coordinación, control, precisión y respeto por la tradición.',
      nivel: 'Todos',
      edad: 'Desde 12 años',
      dias: 'Viernes',
      horarios: '19:00 - 20:00',
      imagen: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600',
    },
    {
      id: 3,
      nombre: 'AIKIDO',
      descripcion:
        'Armonía, control y técnica. Trabajo de movilidad, caídas y aplicación de técnicas con compañero.',
      nivel: 'Todos',
      edad: 'Desde 14 años',
      dias: 'Sábado',
      horarios: '10:00 - 11:00',
      imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600',
    },
    {
      id: 4,
      nombre: 'DEFENSA PERSONAL',
      descripcion:
        'Técnicas aplicadas al contexto real: prevención, lectura de situaciones y respuesta efectiva.',
      nivel: 'Todos',
      edad: 'Desde 14 años',
      dias: 'Sábado',
      horarios: '11:15 - 12:15',
      imagen: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600',
    },
  ];

  const handleSelectClass = (clase: Clase) => {
    setSelectedClass(clase);
    setModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-anton text-6xl md:text-7xl text-primary leading-none mb-6">
            NUESTRAS
            <br />
            CLASES
          </h1>
          <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
            Entrená en Shinseikan con clases para distintos niveles y objetivos. Consultá horarios y
            sumate a una clase de prueba.
          </p>
        </div>

        {/* Grid de Clases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {clases.map((clase) => (
            <div
              key={clase.id}
              className="bg-card border border-border overflow-hidden hover:border-primary transition group cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={clase.imagen}
                  alt={clase.nombre}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition"
                />
              </div>
              <div className="p-6">
                <h3 className="font-anton text-2xl text-primary mb-3">{clase.nombre}</h3>
                <p className="text-white opacity-90 mb-4 text-sm">{clase.descripcion}</p>

                <div className="space-y-2 mb-6 text-sm text-white opacity-75">
                  <div>
                    <span className="font-bold">Nivel:</span> {clase.nivel}
                  </div>
                  <div>
                    <span className="font-bold">Edad:</span> {clase.edad}
                  </div>
                  <div>
                    <span className="font-bold">Días:</span> {clase.dias}
                  </div>
                  <div>
                    <span className="font-bold">Horarios:</span> {clase.horarios}
                  </div>
                </div>

                <button onClick={() => handleSelectClass(clase)} className="btn btn-primary w-full">
                  INSCRIBIRSE →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white text-lg mb-6">¿No encontrás la clase que buscás?</p>
          <button onClick={() => setModalOpen(true)} className="btn btn-secondary">
            CONTACTÁ CON NOSOTROS →
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-anton text-primary text-3xl mb-4">
          {selectedClass ? `INSCRIBIRSE EN ${selectedClass.nombre}` : 'CONTACTANOS'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('¡Oss! Tu solicitud fue enviada. Te contactamos pronto.');
            setModalOpen(false);
          }}
        >
          <input
            type="text"
            placeholder="NOMBRE COMPLETO"
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-4 text-sm font-bold"
            required
          />
          <input
            type="email"
            placeholder="EMAIL"
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-4 text-sm font-bold"
            required
          />
          <input
            type="tel"
            placeholder="WHATSAPP"
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-4 text-sm font-bold"
            required
          />
          {selectedClass && (
            <input
              type="text"
              placeholder="Clase seleccionada"
              value={selectedClass.nombre}
              disabled
              className="w-full bg-gray-800 border border-gray-600 text-gray-400 p-3 mb-6 text-sm font-bold"
            />
          )}
          <button type="submit" className="btn btn-primary w-full">
            ENVIAR →
          </button>
        </form>
      </Modal>
    </>
  );
}

