# Shinseikan Karate - Next.js Website

Sitio web moderno de la escuela Shinseikan Karate construido con Next.js, TypeScript y Tailwind CSS.

## Características

- Diseño moderno y responsivo
- Tema oscuro con acentos rojo neón
- Mobile-first
- Formularios de contacto e inscripción
- Tienda de productos
- Estructura lista para sumar sedes a futuro

## Requisitos

- Node.js 18+ (recomendado: Node 20+)
- npm

## Instalación

```bash
npm install
```

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Modo desarrollo (opcional, suele arrancar más rápido en algunos entornos):

```bash
npm run dev:turbo
```

El sitio estará disponible en `http://localhost:3000`.

## Build para producción

```bash
npm run build
npm run start
```

## Navegación

- `/` - Home
- `/clases` - Información de clases
- `/inscripciones` - Planes y membresías
- `/shop` - Tienda de productos
- `/contacto` - Contacto

## Notas

- Las imágenes son de Unsplash (placeholder).
- Si el dev server demora mucho en Windows, suele ayudar excluir el proyecto (o al menos `.next/` y `node_modules/`) del antivirus/Defender y usar Node 20+.

