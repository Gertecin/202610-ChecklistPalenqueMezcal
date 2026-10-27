import { useState, useEffect } from 'react'
import { Check, X, Search, Settings, ChevronLeft, AlertCircle, Calendar } from 'lucide-react'

// Datos de ejemplo - 20 partidas con resultados variados
const defaultChecklistItems = [
  "Tiempo de horneado en horno de tierra respetado",
  "Molienda en piedra completa y uniforme",
  "Temperatura de fermentación en tinas correcta",
  "Corte de cabezas y colas hecho por el maestro mezcalero",
  "Graduación alcohólica final verificada"
]

const generateSeedData = () => {
  const partidas = []
  const tiposAgave = ['Espadín', 'Tobalá', 'Tepeztate', 'Madrecuixe', 'Arroqueño']
  
  for (let i = 1; i <= 20; i++) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - (20 - i) * 2)
    
    const items = defaultChecklistItems.map(item => ({
      texto: item,
      cumplido: Math.random() > 0.2 // 80% de probabilidad de estar cumplido
    }))
    
    // Asegurar al menos 3 partidas con incidencias
    if (i <= 3) {
      items[Math.floor(Math.random() * items.length)].cumplido = false
    }
    
    partidas.push({
      id: `PARTIDA-${String(i).padStart(3, '0')}`,
      fecha: fecha.toISOString().split('T')[0],
      numeroLote: `L-${2026}-${String(i).padStart(3, '0')}`,
      items: items,
      observaciones: `Tipo de agave: ${tiposAgave[i % tiposAgave.length]}. Lote procesado según tradición familiar.`,
      tieneIncidencia: items.some(item => !item.cumplido)
    })
  }
  
  return partidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

function App() {
  const [vista, setVista] = useState('checklist') // checklist, historial, detalle, admin
  const [partidas, setPartidas] = useState([])
  const [checklistItems, setChecklistItems] = useState(defaultChecklistItems)
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  
  // Formulario de checklist
  const [formData, setFormData] = useState({
    numeroLote: '',
    fecha: new Date().toISOString().split('T')[0],
    items: {},
    observaciones: ''
  })

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const savedPartidas = localStorage.getItem('partidas')
    const savedItems = localStorage.getItem('checklistItems')
    
    if (savedPartidas) {
      setPartidas(JSON.parse(savedPartidas))
    } else {
      const seedData = generateSeedData()
      setPartidas(seedData)
      localStorage.setItem('partidas', JSON.stringify(seedData))
    }
    
    if (savedItems) {
      setChecklistItems(JSON.parse(savedItems))
    }
  }, [])

  // Guardar partidas en localStorage cuando cambien
  useEffect(() => {
    if (partidas.length > 0) {
      localStorage.setItem('partidas', JSON.stringify(partidas))
    }
  }, [partidas])

  const handleItemCheck = (item, value) => {
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [item]: value
      }
    }))
  }

  const guardarChecklist = () => {
    if (!formData.numeroLote || !formData.fecha) {
      alert('Por favor completá el número de lote y la fecha')
      return
    }

    const itemsEvaluados = checklistItems.map(item => ({
      texto: item,
      cumplido: formData.items[item] !== undefined ? formData.items[item] : false
    }))

    const tieneIncidencia = itemsEvaluados.some(item => !item.cumplido)

    const nuevaPartida = {
      id: `PARTIDA-${formData.numeroLote}`,
      numeroLote: formData.numeroLote,
      fecha: formData.fecha,
      items: itemsEvaluados,
      observaciones: formData.observaciones,
      tieneIncidencia
    }

    // Verificar si ya existe
    const existe = partidas.find(p => p.numeroLote === formData.numeroLote)
    
    if (existe) {
      // Actualizar existente
      const partidasActualizadas = partidas.map(p => 
        p.numeroLote === formData.numeroLote ? nuevaPartida : p
      )
      setPartidas(partidasActualizadas)
      alert('Checklist actualizado correctamente')
    } else {
      // Agregar nueva
      setPartidas([nuevaPartida, ...partidas])
      alert('Checklist guardado correctamente')
    }

    // Limpiar formulario
    setFormData({
      numeroLote: '',
      fecha: new Date().toISOString().split('T')[0],
      items: {},
      observaciones: ''
    })
  }

  const verificarPassword = () => {
    if (adminPassword === 'mezcal2026') {
      setShowPasswordModal(false)
      setVista('admin')
      setAdminPassword('')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const handleSaveItems = (nuevosItems) => {
    setChecklistItems(nuevosItems)
    localStorage.setItem('checklistItems', JSON.stringify(nuevosItems))
    alert('Ítems actualizados correctamente')
  }

  // Calcular estadísticas de últimas 30 partidas
  const ultimas30 = partidas.slice(0, 30)
  const conIncidencias = ultimas30.filter(p => p.tieneIncidencia).length

  const partidasFiltradas = partidas.filter(p => 
    p.numeroLote.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-negro text-dorado">
      {/* Header */}
      <header className="bg-gris-oscuro border-b border-terracota p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {vista !== 'checklist' && (
              <button 
                onClick={() => setVista('checklist')}
                className="p-2 hover:bg-terracota rounded transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-terracota">Palenque Mal de Amor</h1>
              <p className="text-sm text-dorado/70">Control de Calidad - Mezcal Artesanal</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="p-2 hover:bg-terracota rounded transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto p-4">
        {vista === 'checklist' && (
          <ChecklistView 
            formData={formData}
            setFormData={setFormData}
            checklistItems={checklistItems}
            handleItemCheck={handleItemCheck}
            guardarChecklist={guardarChecklist}
            setVista={setVista}
          />
        )}
        
        {vista === 'historial' && (
          <HistorialView 
            partidas={partidasFiltradas}
            setPartidaSeleccionada={(p) => {
              setPartidaSeleccionada(p)
              setVista('detalle')
            }}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            conIncidencias={conIncidencias}
          />
        )}
        
        {vista === 'detalle' && partidaSeleccionada && (
          <DetallePartidaView 
            partida={partidaSeleccionada}
            setVista={setVista}
          />
        )}
        
        {vista === 'admin' && (
          <AdminView 
            checklistItems={checklistItems}
            handleSaveItems={handleSaveItems}
            setVista={setVista}
          />
        )}
      </main>

      {/* Navegación inferior */}
      {vista !== 'detalle' && vista !== 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gris-oscuro border-t border-terracota p-4">
          <div className="max-w-4xl mx-auto flex justify-around">
            <button 
              onClick={() => setVista('checklist')}
              className={`flex flex-col items-center gap-1 ${vista === 'checklist' ? 'text-terracota' : 'text-dorado'}`}
            >
              <Check size={24} />
              <span className="text-xs">Checklist</span>
            </button>
            <button 
              onClick={() => setVista('historial')}
              className={`flex flex-col items-center gap-1 ${vista === 'historial' ? 'text-terracota' : 'text-dorado'}`}
            >
              <Calendar size={24} />
              <span className="text-xs">Historial</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modal de password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gris-oscuro p-6 rounded-lg max-w-sm w-full border border-terracota">
            <h2 className="text-xl font-bold mb-4 text-terracota">Acceso a Administración</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-3 mb-4 bg-negro border border-terracota rounded text-dorado"
              onKeyPress={(e) => e.key === 'Enter' && verificarPassword()}
            />
            <div className="flex gap-2">
              <button 
                onClick={verificarPassword}
                className="flex-1 bg-terracota py-2 rounded hover:bg-terracota/80 transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => {
                  setShowPasswordModal(false)
                  setAdminPassword('')
                }}
                className="flex-1 bg-negro border border-terracota py-2 rounded hover:bg-gris-oscuro transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componentes de vistas
function ChecklistView({ formData, setFormData, checklistItems, handleItemCheck, guardarChecklist, setVista }) {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h2 className="text-xl font-bold mb-4 text-terracota">Nueva Partida</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Número de Lote</label>
            <input
              type="text"
              value={formData.numeroLote}
              onChange={(e) => setFormData({...formData, numeroLote: e.target.value})}
              className="w-full p-3 bg-negro border border-terracota rounded text-dorado"
              placeholder="Ej: 001"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              className="w-full p-3 bg-negro border border-terracota rounded text-dorado"
            />
          </div>
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h2 className="text-xl font-bold mb-4 text-terracota">Checklist de Calidad</h2>
        
        <div className="space-y-3">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-negro rounded border border-dorado/30">
              <span className="flex-1 pr-4">{item}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleItemCheck(item, true)}
                  className={`p-2 rounded ${formData.items[item] === true ? 'bg-terracota text-white' : 'bg-negro border border-dorado'}`}
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => handleItemCheck(item, false)}
                  className={`p-2 rounded ${formData.items[item] === false ? 'bg-red-600 text-white' : 'bg-negro border border-dorado'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <label className="block text-sm mb-2">Observaciones</label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
          className="w-full p-3 bg-negro border border-terracota rounded text-dorado h-24"
          placeholder="Tipo de agave, notas del maestro mezcalero..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={guardarChecklist}
          className="flex-1 bg-terracota py-3 rounded-lg font-bold hover:bg-terracota/80 transition-colors"
        >
          Guardar Checklist
        </button>
        <button
          onClick={() => setVista('historial')}
          className="flex-1 bg-negro border border-terracota py-3 rounded-lg font-bold hover:bg-gris-oscuro transition-colors"
        >
          Ver Historial
        </button>
      </div>
    </div>
  )
}

function HistorialView({ partidas, setPartidaSeleccionada, busqueda, setBusqueda, conIncidencias }) {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dorado" size={20} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número de lote..."
            className="w-full pl-10 p-3 bg-negro border border-terracota rounded text-dorado"
          />
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-terracota" size={20} />
          <p className="text-sm">
            <span className="font-bold text-terracota">{conIncidencias}</span> de las últimas 30 partidas tuvieron incidencias
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {partidas.map((partida) => (
          <button
            key={partida.id}
            onClick={() => setPartidaSeleccionada(partida)}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              partida.tieneIncidencia 
                ? 'bg-red-900/20 border-red-600' 
                : 'bg-gris-oscuro border-terracota hover:bg-gris-oscuro/80'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-terracota">{partida.numeroLote}</h3>
                <p className="text-sm text-dorado/70">{partida.fecha}</p>
              </div>
              {partida.tieneIncidencia && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  CON INCIDENCIA
                </span>
              )}
            </div>
            <p className="text-sm mt-2 text-dorado/80 line-clamp-2">
              {partida.observaciones}
            </p>
          </button>
        ))}
      </div>

      {partidas.length === 0 && (
        <div className="text-center py-8 text-dorado/60">
          No hay partidas registradas
        </div>
      )}
    </div>
  )
}

function DetallePartidaView({ partida, setVista }) {
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h2 className="text-xl font-bold mb-4 text-terracota">{partida.numeroLote}</h2>
        <div className="space-y-2">
          <p className="flex justify-between">
            <span className="text-dorado/70">Fecha:</span>
            <span className="font-bold">{partida.fecha}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-dorado/70">ID:</span>
            <span className="font-bold">{partida.id}</span>
          </p>
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h3 className="text-lg font-bold mb-4 text-terracota">Checklist</h3>
        <div className="space-y-2">
          {partida.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-negro rounded">
              <span className="flex-1">{item.texto}</span>
              {item.cumplido ? (
                <Check className="text-green-500" size={24} />
              ) : (
                <X className="text-red-500" size={24} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h3 className="text-lg font-bold mb-2 text-terracota">Observaciones</h3>
        <p className="text-dorado/80">{partida.observaciones || 'Sin observaciones'}</p>
      </div>

      <button
        onClick={() => setVista('historial')}
        className="w-full bg-terracota py-3 rounded-lg font-bold hover:bg-terracota/80 transition-colors"
      >
        Volver al Historial
      </button>
    </div>
  )
}

function AdminView({ checklistItems, handleSaveItems, setVista }) {
  const [items, setItems] = useState([...checklistItems])
  const [nuevoItem, setNuevoItem] = useState('')

  const agregarItem = () => {
    if (nuevoItem.trim()) {
      setItems([...items, nuevoItem.trim()])
      setNuevoItem('')
    }
  }

  const eliminarItem = (index) => {
    if (items.length > 1) {
      const nuevos = items.filter((_, i) => i !== index)
      setItems(nuevos)
    } else {
      alert('Debe haber al menos un ítem en el checklist')
    }
  }

  const guardar = () => {
    handleSaveItems(items)
    setVista('checklist')
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h2 className="text-xl font-bold mb-4 text-terracota">Administrar Ítems del Checklist</h2>
        
        <div className="space-y-3 mb-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-negro rounded">
              <span className="flex-1">{item}</span>
              <button
                onClick={() => eliminarItem(index)}
                className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={nuevoItem}
            onChange={(e) => setNuevoItem(e.target.value)}
            placeholder="Nuevo ítem..."
            className="flex-1 p-3 bg-negro border border-terracota rounded text-dorado"
            onKeyPress={(e) => e.key === 'Enter' && agregarItem()}
          />
          <button
            onClick={agregarItem}
            className="px-4 bg-terracota rounded hover:bg-terracota/80 transition-colors"
          >
            Agregar
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={guardar}
            className="flex-1 bg-terracota py-3 rounded-lg font-bold hover:bg-terracota/80 transition-colors"
          >
            Guardar Cambios
          </button>
          <button
            onClick={() => setVista('checklist')}
            className="flex-1 bg-negro border border-terracota py-3 rounded-lg font-bold hover:bg-gris-oscuro transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default App