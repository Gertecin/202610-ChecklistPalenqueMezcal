# Palenque Mal de Amor - Control de Calidad de Mezcal
Aplicación de checklist de calidad para partidas de producción de mezcal artesanal.

## URL
- Repositorio Github: https://github.com/Gertecin/261026-ChecklistPalenqueMezcal/
- Web de visualizacion:  https://gertecin.github.io/261026-ChecklistPalenqueMezcal/

## Estructura del proyecto
261026-ChecklistPalenqueMezcal/
├── .github/
│   └── workflows/
│       └── static.yml          # Workflow de GitHub Actions para deploy automático
├── public/
│   ├── favicon.svg             # Icono de la pestaña del navegador
│   └── icons.svg               # Iconos adicionales
├── src/
│   ├── assets/
│   │   ├── hero.png            # Imagen de fondo (si se usa)
│   │   ├── react.svg           # Logo React
│   │   └── vite.svg            # Logo Vite
│   ├── App.jsx                 # Componente principal con toda la lógica
│   ├── App.css                 # Estilos base (vacío, usa Tailwind)
│   ├── index.css               # Configuración de Tailwind y colores personalizados
│   ── main.jsx                # Punto de entrada de React
├── .gitignore                  # Archivos a ignorar en Git (node_modules, dist)
├── eslint.config.js            # Configuración de ESLint
├── index.html                  # HTML principal (carga fuentes y scripts)
├── package.json                # Dependencias y scripts del proyecto
├── package-lock.json           # Versiones exactas de dependencias
── vite.config.js              # Configuración de Vite + Tailwind + base path
└── README.md                   # Documentación del proyecto

## Descripcion archivos clave
Archivo | Función
src/App.jsx | Toda la lógica de la app: checklist, historial, admin, modales
src/index.css | Paleta de colores (terracota, negro, dorado, gris) y tipografías
vite.config.js | Configura el base: '/261026-ChecklistPalenqueMezcal/' para GitHub Pages
index.html | Carga las fuentes Google (Oswald + Inter) y el script de React
.github/workflows/static.yml | Build y deploy automático a GitHub Pages en cada push
package.json | Scripts: npm run dev, npm run build, npm run preview

## Características
- Checklist por partida con controles de calidad
- Historial de todas las partidas
- Búsqueda de partidas
- Estadísticas de incidencias (últimas 30 partidas)
- Panel de administración para editar ítems
- Persistencia en localStorage
- Diseño mobile-first

## Instalación ```bash
npm install
npm run dev


## Funcionalidades

### Checklist
Registro de ID de partida con número de lote y fecha (EXTRA el lote se llena de forma automática a partir de la fecha)
Evaluación sí/no de cada ítem de calidad (EXTRA : Guardar checklist con item no marcados se guardan con NO)
Campo de observaciones libres
No se puede duplicar una partida (se actualiza si existe) = (EXTRA : Se graba acualizando la partida con el numero de Lote inicial pero la nueva fecha y aparece en historial (rev. n))

### Historial
Lista ordenada de más reciente a más antigua (hecho por entradas, no incide en la fecha que se introduce en el check list)
Indicador visual rojo para partidas con incidencias
Buscador por número de lote
Contador de partidas con incidencias (últimas 30)

### Administración
- Contraseña: mezcal2026 (Para cambiar la contraseña: editar src/App.jsx, buscar la función verificarPassword y modificar el valor 'mezcal2026')
Agregar/eliminar ítems del checklist Los cambios se guardan en localStorage

### Stack Tecnológico
React 19
Vite
Tailwind CSS v4
localStorage (sin backend)
Lucide React (iconos)

### Colores
Terracota: #C0714B
Negro: #1B1613
Dorado: #C9A356
Gris Oscuro: #2A2620

### Tipografía
Títulos: Oswald
Texto: Inter

### Datos de ejemplo
La aplicación incluye mas 20 partidas precargadas con:
Fechas variadas
Diferentes tipos de agave (Espadín, Tobalá, Tepeztate, etc.)
con mas de 3 partidas con incidencias marcadas

## Reiniciar datos de ejemplo
Abrir DevTools del navegador (F12)
Ir a Application > Local Storage
Eliminar las claves "partidas" y "checklistItems"
Recargar la página
