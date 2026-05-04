'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface Membresia {
  id: number;
  nombre: string;
  precio: string;
  caracteristicas: string[];
  color: string;
  destacada?: boolean;
}

export default function InscripcionesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Membresia | null>(null);

  const membresias: Membresia[] = [
    {
      id: 1,
      nombre: 'BÁSICA',
      precio: '$99/mes',
      caracteristicas: [
        'Acceso a 2 clases por semana',
        'Karate-Do (Martes y Jueves)',
        'Acceso al Dojo Central',
        'Clase de prueba gratis',
      ],
      color: 'border-gray-600',
    },
    {
      id: 2,
      nombre: 'PROFESIONAL',
      precio: '$199/mes',
      caracteristicas: [
        'Acceso ilimitado a todas las clases',
        'Karate-Do + Kobudo + Aikido + Defensa Personal',
        'Acceso prioritario a torneos y seminarios',
        'Descuentos en shop',
        'Clase de prueba gratis',
      ],
      color: 'border-primary',
      destacada: true,
    },
    {
      id: 3,
      nombre: 'COMPETENCIA',
      precio: '$299/mes',
      caracteristicas: [
        'Entrenamiento personalizado',
        'Clases privadas con Sensei',
        'Acceso ilimitado',
        'Uniforme gratis (según disponibilidad)',
        'Asesoramiento y seguimiento',
        'Prioridad en eventos',
      ],
      color: 'border-yellow-500',
    },
    {
      id: 4,
      nombre: 'FAMILIAR',
      precio: '$349/mes',
      caracteristicas: [
        'Hasta 4 miembros de la familia',
        'Acceso ilimitado a todas las clases',
        'Descuentos especiales',
        'Eventos familiares',
        'Clase de prueba gratis',
      ],
      color: 'border-pink-500',
    },
  ];

  const handleSelectPlan = (plan: Membresia) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-anton text-6xl md:text-7xl text-primary leading-none mb-6">
            PLANES Y
            <br />
            MEMBRESÍAS
          </h1>
          <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
            Elegí el plan perfecto para comenzar tu viaje. Todos incluyen clase de prueba gratis.
          </p>
        </div>

        {/* Grid de Membresías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {membresias.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border-2 ${plan.color} p-6 flex flex-col h-full ${
                plan.destacada ? 'lg:scale-105 lg:-mt-4' : ''
              } hover:border-primary transition`}
            >
              {plan.destacada && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-black px-4 py-1 text-xs font-bold">
                  RECOMENDADO
                </div>
              )}

              <h3 className="font-anton text-2xl text-white mb-2">{plan.nombre}</h3>
              <div className="text-primary font-anton text-3xl mb-6">{plan.precio}</div>

              <ul className="space-y-3 mb-8 flex-grow text-sm text-white opacity-90">
                {plan.caracteristicas.map((caract, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>{caract}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`btn w-full ${plan.destacada ? 'btn-primary' : 'btn-outline'}`}
              >
                ELEGIR PLAN →
              </button>
            </div>
          ))}
        </div>

        {/* Información Adicional */}
        <div className="bg-card border border-border p-8 rounded mb-12">
          <h3 className="font-anton text-2xl text-primary mb-6">¿POR QUÉ ELEGIR SHINSEIKAN?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-white mb-2">Dojo Central</h4>
              <p className="text-white opacity-75 text-sm">
                Entrená en nuestro Dojo Central con una estructura lista para sumar sedes a futuro.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Formación Continua</h4>
              <p className="text-white opacity-75 text-sm">
                Instructores con experiencia y entrenamiento constante, enfocados en técnica y valores.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Comunidad Activa</h4>
              <p className="text-white opacity-75 text-sm">
                Participá en eventos, seminarios y actividades para seguir creciendo en el camino.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h3 className="font-anton text-3xl text-primary mb-8">PREGUNTAS FRECUENTES</h3>
          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h4 className="font-bold text-white mb-2">¿Puedo cambiar mi plan?</h4>
              <p className="text-white opacity-75">
                Sí, podés cambiar tu plan en cualquier momento. Los cambios se reflejan en el próximo ciclo.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h4 className="font-bold text-white mb-2">¿Hay contrato de largo plazo?</h4>
              <p className="text-white opacity-75">No, todos nuestros planes son mes a mes. Cancelá cuando quieras.</p>
            </div>
            <div className="border-b border-border pb-6">
              <h4 className="font-bold text-white mb-2">¿Incluye uniforme?</h4>
              <p className="text-white opacity-75">
                Algunos planes incluyen uniforme (gi). Consultá con nuestro equipo para más detalles.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">¿Hay clases de prueba?</h4>
              <p className="text-white opacity-75">
                ¡Sí! Tu primera clase es completamente gratis. Vení a conocer nuestro dojo y a nuestros instructores.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-primary/10 border border-primary p-8">
          <h3 className="font-anton text-3xl text-primary mb-4">¿LISTO PARA COMENZAR?</h3>
          <p className="text-white mb-6">¡Tu primera clase es completamente gratis! Sin compromiso, sin sorpresas.</p>
          <button
            onClick={() => {
              setSelectedPlan(null);
              setModalOpen(true);
            }}
            className="btn btn-primary"
          >
            AGENDAR CLASE GRATIS →
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-anton text-primary text-3xl mb-4">
          {selectedPlan ? `INSCRIBIRSE EN ${selectedPlan.nombre}` : 'AGENDAR CLASE GRATIS'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('¡Oss! Tu solicitud fue registrada. Te contactaremos en breve por WhatsApp.');
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
          {selectedPlan && (
            <input
              type="text"
              placeholder="Plan seleccionado"
              value={selectedPlan.nombre}
              disabled
              className="w-full bg-gray-800 border border-gray-600 text-gray-400 p-3 mb-6 text-sm font-bold"
            />
          )}
          <button type="submit" className="btn btn-primary w-full">
            CONFIRMAR →
          </button>
        </form>
      </Modal>
    </>
  );
}

