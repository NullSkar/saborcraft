# 🎨 Guía de Estilos SaborCraft - Tailwind CSS

Esta guía muestra cómo usar todas las clases personalizadas configuradas en Tailwind CSS según tu guía de estilos.

## 🌈 Colores

### Tema Claro (Por defecto)
```css
bg-light-bg        /* Fondo claro: #FCFCFC */
text-light-text    /* Texto oscuro: #0F0E06 */
bg-light-primary   /* Color primario: #00272B */
bg-light-secondary /* Color secundario: #00504B */
bg-light-tertiary  /* Color terciario: #1F7B60 */
bg-light-accent    /* Color acento: #FF8B41 */
```

### Tema Oscuro (con clase `dark`)
```css
bg-dark-bg         /* Fondo oscuro: #010104 */
text-dark-text     /* Texto claro: #eae9fc */
bg-dark-primary    /* Color primario: #00A896 */
bg-dark-secondary  /* Color secundario: #00C4A1 */
bg-dark-tertiary   /* Color terciario: #4DDBC4 */
bg-dark-accent     /* Color acento: #FF8B41 */
```

## ✍️ Tipografía

### Familias de Fuentes
```css
font-heading  /* Poppins - Para títulos */
font-body     /* Inter - Para cuerpo de texto */
font-accent   /* Caveat - Para acentos decorativos */
```

### Tamaños de Fuente
```css
text-h1      /* 48px (3rem) */
text-h2      /* 38px (2.4rem) */
text-h3      /* 30px (1.9rem) */
text-h4      /* 24px (1.5rem) */
text-h5      /* 19px (1.2rem) */
text-h6      /* 16px (1rem) */
text-body    /* 16px (1rem) - base */
text-small   /* 13px (0.8rem) */
text-caption /* 10px (0.6rem) */
```

### Pesos de Fuente
```css
font-regular  /* 400 - texto de cuerpo */
font-medium   /* 500 - énfasis sutil */
font-bold     /* 700 - títulos y énfasis fuerte */
```

### Altura de Línea
```css
leading-readable  /* 1.5 - Para legibilidad óptima */
leading-compact   /* 1.4 - Para espacios compactos */
```

## 📏 Espaciado

### Espaciado Base (múltiplos de 8px)
```css
p-2     /* 8px */
p-4     /* 16px */
p-6     /* 24px */
p-8     /* 32px */
p-12    /* 48px */
p-16    /* 64px */
```

### Espaciado Semántico
```css
p-padding      /* 16px - padding interno estándar */
p-padding-lg   /* 24px - padding interno grande */
mb-section     /* 48px - margen entre secciones */
mb-section-lg  /* 64px - margen entre secciones grande */
```

## 📐 Layout

### Ancho Máximo
```css
max-w-content  /* 1200px - ancho máximo del contenido */
```

### Clases de Utilidad Personalizadas
```css
container-content  /* Contenedor centrado con padding responsive */
section-spacing    /* Espaciado estándar entre secciones */
```

## 🔘 Bordes y Esquinas

### Border Radius
```css
rounded-small   /* 4px */
rounded-medium  /* 8px */
rounded-large   /* 16px */
```

### Anchos de Borde
```css
border-subtle   /* 1px */
border-normal   /* 2px */
```

## 🌟 Sombras

```css
shadow-subtle  /* Sombra sutil: 0 2px 4px rgba(0,0,0,0.1) */
shadow-medium  /* Sombra media: 0 4px 12px rgba(0,0,0,0.15) */
shadow-strong  /* Sombra fuerte: 0 8px 24px rgba(0,0,0,0.2) */
```

## 🎭 Estados Interactivos

### Clases de Utilidad Personalizadas
```css
hover-effect    /* Efecto hover con transición de opacidad */
active-effect   /* Efecto active con escala */
interactive     /* Combina hover, active y focus */
```

### Opacidades
```css
opacity-hover     /* 0.8 - para estados hover */
opacity-disabled  /* 0.5 - para elementos deshabilitados */
```

### Escalas
```css
scale-active  /* 0.95 - para estados active */
```

## 📱 Breakpoints Responsive

```css
mobile:   /* 320px+ */
tablet:   /* 768px+ */
desktop:  /* 1024px+ */
```

## 🌙 Modo Oscuro

Para activar el modo oscuro, añade la clase `dark` al elemento `<html>`:

```javascript
// Activar modo oscuro
document.documentElement.classList.add('dark')

// Desactivar modo oscuro
document.documentElement.classList.remove('dark')
```

## 💡 Ejemplos de Uso

### Botón Primario
```vue
<button class="interactive bg-light-primary dark:bg-dark-primary text-light-bg dark:text-dark-bg px-6 py-3 rounded-medium font-medium shadow-medium">
  Mi Botón
</button>
```

### Tarjeta
```vue
<div class="bg-light-bg dark:bg-dark-bg border border-light-primary/20 dark:border-dark-primary/20 rounded-large p-padding shadow-subtle">
  <h3 class="font-heading font-bold text-light-primary dark:text-dark-primary">Título</h3>
  <p class="text-small text-light-text dark:text-dark-text">Contenido de la tarjeta</p>
</div>
```

### Contenedor Principal
```vue
<main class="container-content">
  <section class="section-spacing">
    <h1 class="text-light-primary dark:text-dark-primary">Mi Título</h1>
    <p class="text-body text-light-text dark:text-dark-text">Mi contenido</p>
  </section>
</main>
```

### Texto con Fuente de Acento
```vue
<p class="font-accent text-h4 text-light-accent dark:text-dark-accent">
  Texto decorativo con Caveat
</p>
```

