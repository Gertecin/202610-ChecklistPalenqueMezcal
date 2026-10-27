# Palenque Mal de Amor - Control de Calidad de Mezcal
Aplicación de checklist de calidad para partidas de producción de mezcal artesanal.

## URL
- Repositorio Github: https://github.com/Gertecin/261026-ChecklistPalenqueMezcal/
- Web de visualizacion:  https://gertecin.github.io/261026-ChecklistPalenqueMezcal/

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

Datos de ejemplo
La aplicación incluye mas 20 partidas precargadas con:
Fechas variadas
Diferentes tipos de agave (Espadín, Tobalá, Tepeztate, etc.)
con mas de 3 partidas con incidencias marcadas

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

## Reiniciar datos de ejemplo
Abrir DevTools del navegador (F12)
Ir a Application > Local Storage
Eliminar las claves "partidas" y "checklistItems"
Recargar la página
