'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: string;
  descripcion: string;
  imagen: string;
}

export default function ShopPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [filterCategory, setFilterCategory] = useState('todos');

  const productos: Producto[] = [
    {
      id: 1,
      nombre: 'Karategi Tradicional (Blanco)',
      categoria: 'uniformes',
      precio: '$150',
      descripcion: 'Uniforme clásico para Karate-Do. Tela resistente y cómoda para entrenamientos diarios.',
      imagen: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400',
    },
    {
      id: 2,
      nombre: 'Cinturones (Todos los colores)',
      categoria: 'accesorios',
      precio: '$25',
      descripcion: 'Cinturones disponibles para todas las graduaciones.',
      imagen: 'https://images.unsplash.com/photo-1552168324-d612d08db8e7?q=80&w=400',
    },
    {
      id: 3,
      nombre: 'Guantes de Entrenamiento',
      categoria: 'proteccion',
      precio: '$45',
      descripcion: 'Guantes de protección para práctica controlada. Ajuste cómodo y buena absorción.',
      imagen: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400',
    },
    {
      id: 4,
      nombre: 'Bokken (Aikido)',
      categoria: 'kobudo_aikido',
      precio: '$65',
      descripcion: 'Arma de práctica tradicional para entrenamientos de Aikido (según disponibilidad).',
      imagen: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=400',
    },
    {
      id: 5,
      nombre: 'Jo (Aikido)',
      categoria: 'kobudo_aikido',
      precio: '$55',
      descripcion: 'Bastón de práctica para ejercicios de Aikido (según disponibilidad).',
      imagen: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=400',
    },
    {
      id: 6,
      nombre: 'Bolsa de Entrenamiento',
      categoria: 'accesorios',
      precio: '$120',
      descripcion: 'Bolso resistente para llevar tu equipo al dojo.',
      imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400',
    },
    {
      id: 7,
      nombre: 'Botella Deportiva Shinseikan',
      categoria: 'accesorios',
      precio: '$30',
      descripcion: 'Botella reutilizable ideal para mantenerte hidratado durante la clase.',
      imagen: 'https://images.unsplash.com/photo-1602143407151-7111542de6e9?q=80&w=400',
    },
    {
      id: 8,
      nombre: 'Remera Shinseikan',
      categoria: 'ropa',
      precio: '$40',
      descripcion: 'Remera de algodón con diseño Shinseikan.',
      imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400',
    },
    {
      id: 9,
      nombre: 'Protector Bucal',
      categoria: 'proteccion',
      precio: '$25',
      descripcion: 'Protector bucal moldeable. Recomendado para prácticas con contacto controlado.',
      imagen: 'https://images.unsplash.com/photo-1514306688772-0fbf87c01202?q=80&w=400',
    },
  ];

  const categorias = [
    { id: 'todos', label: 'TODOS' },
    { id: 'uniformes', label: 'UNIFORMES' },
    { id: 'proteccion', label: 'PROTECCIÓN' },
    { id: 'ropa', label: 'ROPA' },
    { id: 'accesorios', label: 'ACCESORIOS' },
    { id: 'kobudo_aikido', label: 'KOBUDO / AIKIDO' },
  ];

  const productosFiltrados =
    filterCategory === 'todos' ? productos : productos.filter((p) => p.categoria === filterCategory);

  const handleSelectProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-anton text-6xl md:text-7xl text-primary leading-none mb-6">
            TIENDA
            <br />
            SHINSEIKAN
          </h1>
          <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
            Equipamiento para tu práctica: uniformes, protección y accesorios.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`btn ${filterCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => handleSelectProduct(producto)}
              className="bg-card border border-border overflow-hidden hover:border-primary transition group cursor-pointer"
            >
              <div className="relative h-64 bg-gray-900 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition"
                />
              </div>
              <div className="p-6">
                <p className="text-primary text-xs font-bold mb-2 uppercase">{producto.categoria}</p>
                <h3 className="font-anton text-xl text-white mb-2">{producto.nombre}</h3>
                <p className="text-white opacity-75 text-sm mb-4">{producto.descripcion}</p>
                <div className="flex justify-between items-center">
                  <span className="font-anton text-2xl text-primary">{producto.precio}</span>
                  <button className="btn btn-primary text-sm">COMPRAR →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-card border border-border p-8 mb-12">
          <h3 className="font-anton text-2xl text-primary mb-6">ENVÍOS Y GARANTÍA</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-white mb-2">Entrega Coordinada</h4>
              <p className="text-white opacity-75 text-sm">
                Coordinamos la entrega/retira con el Dojo Central.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Calidad</h4>
              <p className="text-white opacity-75 text-sm">
                Productos seleccionados para entrenamiento real. Consultá por talles y stock.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Descuentos</h4>
              <p className="text-white opacity-75 text-sm">Los miembros pueden acceder a promociones especiales.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedProduct && (
          <>
            <div className="mb-4">
              <p className="text-primary text-xs font-bold uppercase">{selectedProduct.categoria}</p>
              <h3 className="font-anton text-primary text-3xl mb-2">{selectedProduct.nombre}</h3>
              <p className="text-white opacity-90 mb-4">{selectedProduct.descripcion}</p>
              <div className="font-anton text-3xl text-primary mb-6">{selectedProduct.precio}</div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('¡Producto agregado! Te contactaremos para coordinar la compra.');
                setModalOpen(false);
              }}
            >
              <label className="block text-white text-sm font-bold mb-2">Cantidad</label>
              <select className="w-full bg-gray-900 border border-gray-700 text-white p-3 mb-4 text-sm font-bold">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <label className="block text-white text-sm font-bold mb-2">Datos de Contacto</label>
              <input
                type="text"
                placeholder="NOMBRE COMPLETO"
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
                COMPRAR AHORA →
              </button>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}

