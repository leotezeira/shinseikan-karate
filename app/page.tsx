'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'KARATE-DO',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=800',
    },
    {
      title: 'KOBUDO',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800',
    },
    {
      title: 'AIKIDO',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
    },
    {
      title: 'DEFENSA PERSONAL',
      image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800',
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <>
      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-5 animate-in fade-in">
        <h1
          className="font-anton text-6xl md:text-8xl text-primary leading-none mb-8 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          SHINSEIKAN
          <br />
          KARATE
        </h1>
        <p
          className="text-lg md:text-2xl font-bold max-w-2xl mb-12 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <span className="block">DOJO CENTRAL · CÓRDOBA</span>
          <span className="block">CLASE DE PRUEBA GRATIS</span>
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-secondary mb-4 w-full md:w-auto animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          CLASE DE PRUEBA →
        </button>
        <Link
          href="/clases"
          className="btn btn-primary w-full md:w-auto animate-fade-in inline-flex items-center justify-center"
          style={{ animationDelay: '0.6s' }}
        >
          VER CLASES →
        </Link>
      </section>

      {/* DISCIPLINAS */}
      <section className="py-20 px-5 max-w-7xl mx-auto">
        <h2 className="section-title mb-4">DISCIPLINAS</h2>
        <p className="text-white mb-12 opacity-90">
          Karate-Do, Kobudo, Aikido y Defensa Personal. Entrenamiento real, técnica y valores.
        </p>

        {/* Slider */}
        <div className="mb-8">
          <div className="relative w-full h-96 bg-gray-900 overflow-hidden">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-anton text-3xl md:text-4xl text-white mb-4 whitespace-pre-line text-left">
                    {slide.title}
                  </h3>
                  <Link href="/clases" className="btn btn-outline inline-block">
                    VER MÁS →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex-1 h-0.5 bg-gray-700 mr-6">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex gap-6 text-2xl cursor-pointer">
              <button onClick={prevSlide} className="hover:text-primary transition">
                ←
              </button>
              <button onClick={nextSlide} className="hover:text-primary transition">
                →
              </button>
            </div>
          </div>
        </div>

        <Link href="/clases" className="btn btn-primary w-full inline-flex justify-center">
          TODAS LAS CLASES →
        </Link>
      </section>

      {/* DOJO CENTRAL */}
      <section className="py-20 px-5 max-w-7xl mx-auto">
        <h2 className="section-title mb-8">DOJO CENTRAL</h2>
        <Link
          href="/contacto"
          className="flex justify-between items-center border-b border-gray-700 py-6 hover:pl-2 transition group"
        >
          <span className="text-lg font-bold">Carlos Tejedor 1165 · B° San Vicente · Córdoba</span>
          <span className="text-2xl group-hover:text-primary transition">→</span>
        </Link>
      </section>

      {/* Modal Inscripción */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-anton text-primary text-3xl mb-6">EMPEZÁ HOY</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('¡Oss! Te escribimos por WhatsApp para coordinar tu clase de prueba.');
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
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-6 text-sm font-bold"
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            QUIERO MI CLASE GRATIS →
          </button>
        </form>
      </Modal>
    </>
  );
}

