'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = !menuOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 bg-black/90 backdrop-blur-sm">
        <div className="flex justify-between items-center p-5 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="border-2 border-white p-1 text-center text-white font-anton text-xs leading-tight tracking-widest">
            SHINSEIKAN<br />KARATE
          </div>

          {/* Join Now Button */}
          <Link href="/inscripciones" className="font-anton font-black text-sm tracking-widest cursor-pointer hover:text-primary transition">
            ÚNETE AHORA
          </Link>

          {/* Hamburger */}
          <button
            onClick={toggleMenu}
            className="w-6 h-4 flex flex-col justify-between cursor-pointer z-50"
            aria-label="Toggle menu"
          >
            <span className="w-full h-0.5 bg-white"></span>
            <span className="w-full h-0.5 bg-white"></span>
          </button>
        </div>
      </header>

      {/* Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <button
          onClick={closeMenu}
          className="absolute top-5 right-5 text-white text-4xl hover:text-primary transition"
          aria-label="Close menu"
        >
          ×
        </button>

        <nav className="flex flex-col items-center gap-7">
          <Link href="/" onClick={closeMenu} className="text-white text-4xl font-anton tracking-widest hover:text-primary transition">
            INICIO
          </Link>
          <Link href="/clases" onClick={closeMenu} className="text-white text-4xl font-anton tracking-widest hover:text-primary transition">
            CLASES
          </Link>
          <Link href="/inscripciones" onClick={closeMenu} className="text-white text-4xl font-anton tracking-widest hover:text-primary transition">
            INSCRIPCIONES
          </Link>
          <Link href="/shop" onClick={closeMenu} className="text-white text-4xl font-anton tracking-widest hover:text-primary transition">
            SHOP
          </Link>
          <Link href="/contacto" onClick={closeMenu} className="text-white text-4xl font-anton tracking-widest hover:text-primary transition">
            CONTACTO
          </Link>
        </nav>
      </div>
    </>
  );
}
