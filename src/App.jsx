import { useState, useEffect } from 'react'
import { Check, X, Search, Settings, ChevronLeft, AlertCircle, Calendar, Trash2 } from 'lucide-react'

const defaultChecklistItems = [
  "Tiempo de horneado en horno de tierra respetado",
  "Molienda en piedra completa y uniforme",
  "Temperatura de fermentación en tinas correcta",
  "Corte de cabezas y colas hecho por el maestro mezcalero",
  "Graduación alcohólica final verificada"
]

const getLote = (p) => p.lote || p.numeroLote || ''
const getNombre = (p) => p.nombre || p.numeroLote || ''

const generateSeedData = () => {
  const partidas = []
  const tiposAgave = ['Espadín', 'Tobalá', 'Tepeztate', 'Madrecuixe', 'Arroqueño']
  
  for (let i = 1; i <= 20; i++) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - (20 - i) * 2)
    
    const aa = String(fecha.getFullYear()).slice(-2)
    const mm = String(fecha.getMonth() + 1).padStart(2, '0')
    const dd = String(fecha.getDate()).padStart(2, '0')
    const numero = String(i).padStart(3, '0')
    const lote = `${aa}${mm}${dd}-${numero}`
    
    const items = defaultChecklistItems.map(item => ({
      texto: item,
      cumplido: Math.random() > 0.2
    }))
    
    if (i <= 3) {
      items[Math.floor(Math.random() * items.length)].cumplido = false
    }
    
    partidas.push({
      id: `PARTIDA-${lote}`,
      lote: lote,
      nombre: `Partida ${lote}`,
      fecha: fecha.toISOString().split('T')[0],
      items: items,
      observaciones: `Tipo de agave: ${tiposAgave[i % tiposAgave.length]}. Lote procesado según tradición familiar.`,
      tieneIncidencia: items.some(item => !item.cumplido),
      revision: 0
    })
  }
  
  return partidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return ''
  const [y, m, d] = fechaISO.split('-')
  return `${d}/${m}/${y}`
}

const generarLoteAutomatico = (partidas, fecha) => {
  const f = fecha ? new Date(fecha) : new Date()
  const aa = String(f.getFullYear()).slice(-2)
  const mm = String(f.getMonth() + 1).padStart(2, '0')
  const dd = String(f.getDate()).padStart(2, '0')
  const prefijo = `${aa}${mm}${dd}`
  
  const partidasDelDia = partidas.filter(p => getLote(p).startsWith(prefijo))
  
  let maxNumero = 0
  partidasDelDia.forEach(p => {
    const lote = getLote(p)
    const partes = lote.split('-')
    if (partes.length === 2) {
      const numero = parseInt(partes[1], 10)
      if (!isNaN(numero) && numero > maxNumero) {
        maxNumero = numero
      }
    }
  })
  
  const numero = String(maxNumero + 1).padStart(3, '0')
  return `${prefijo}-${numero}`
}

function App() {
  const [vista, setVista] = useState('checklist')
  const [partidas, setPartidas] = useState([])
  const [checklistItems, setChecklistItems] = useState(defaultChecklistItems)
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [showOverwriteModal, setShowOverwriteModal] = useState(false)
  const [overwriteData, setOverwriteData] = useState(null)
  const [showNewNameModal, setShowNewNameModal] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nombreExiste, setNombreExiste] = useState(false)
  const [pendingData, setPendingData] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    lote: '',
    fecha: new Date().toISOString().split('T')[0],
    items: {},
    observaciones: ''
  })

  useEffect(() => {
    const savedPartidas = localStorage.getItem('partidas')
    const savedItems = localStorage.getItem('checklistItems')
    
    if (savedPartidas) {
      let parsed = JSON.parse(savedPartidas)
      parsed = parsed.map(p => ({
        ...p,
        lote: getLote(p),
        nombre: getNombre(p),
        revision: p.revision || 0
      }))
      setPartidas(parsed)
      localStorage.setItem('partidas', JSON.stringify(parsed))
    } else {
      const seedData = generateSeedData()
      setPartidas(seedData)
      localStorage.setItem('partidas', JSON.stringify(seedData))
    }
    
    if (savedItems) {
      setChecklistItems(JSON.parse(savedItems))
    }
  }, [])

  useEffect(() => {
    if (partidas.length > 0) {
      localStorage.setItem('partidas', JSON.stringify(partidas))
    }
  }, [partidas])

  // Regenerar lote cuando cambia la fecha o las partidas
  useEffect(() => {
    if (formData.fecha && partidas.length > 0) {
      const nuevoLote = generarLoteAutomatico(partidas, formData.fecha)
      setFormData(prev => ({
        ...prev,
        lote: nuevoLote
      }))
    }
  }, [formData.fecha])

  // Regenerar lote cuando se actualizan las partidas (después de guardar)
  useEffect(() => {
    if (partidas.length > 0 && formData.fecha && !formData.nombre) {
      const nuevoLote = generarLoteAutomatico(partidas, formData.fecha)
      setFormData(prev => ({
        ...prev,
        lote: nuevoLote
      }))
    }
  }, [partidas])

  useEffect(() => {
    if (formData.nombre.trim()) {
      const existe = partidas.some(p => getNombre(p).toLowerCase() === formData.nombre.toLowerCase())
      setNombreExiste(existe)
    } else {
      setNombreExiste(false)
    }
  }, [formData.nombre, partidas])

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
    if (!formData.nombre || !formData.lote || !formData.fecha) {
      alert('Por favor completá el nombre, el lote y la fecha')
      return
    }

    const itemsEvaluados = checklistItems.map(item => ({
      texto: item,
      cumplido: formData.items[item] !== undefined ? formData.items[item] : false
    }))

    const tieneIncidencia = itemsEvaluados.some(item => !item.cumplido)

    const existente = partidas.find(p => getNombre(p).toLowerCase() === formData.nombre.toLowerCase())

    if (existente) {
      setOverwriteData({
        existente,
        itemsEvaluados,
        tieneIncidencia
      })
      setShowOverwriteModal(true)
      return
    }

    crearNuevaPartida(itemsEvaluados, tieneIncidencia, formData.nombre, formData.lote, formData.fecha, formData.observaciones, 0)
  }

  const crearNuevaPartida = (itemsEvaluados, tieneIncidencia, nombre, lote, fecha, observaciones, revision) => {
    const nuevaPartida = {
      id: `PARTIDA-${lote}-${revision}`,
      lote: lote,
      nombre: nombre,
      fecha: fecha,
      items: itemsEvaluados,
      observaciones: observaciones,
      tieneIncidencia,
      revision
    }

    const otras = partidas.filter(p => getLote(p) !== lote)
    const nuevasPartidas = [nuevaPartida, ...otras]
    setPartidas(nuevasPartidas)
    
    // Calcular el siguiente lote ANTES de resetear
    const siguienteLote = generarLoteAutomatico(nuevasPartidas, fecha)
    
    setFormData({
      nombre: '',
      lote: siguienteLote,
      fecha: fecha,
      items: {},
      observaciones: ''
    })
    
    alert('Checklist guardado correctamente')
  }

  const confirmarSobrescribir = () => {
    if (!overwriteData) return
    const { existente, itemsEvaluados, tieneIncidencia } = overwriteData
    const nuevaRevision = (existente.revision || 0) + 1
    
    crearNuevaPartida(
      itemsEvaluados,
      tieneIncidencia,
      formData.nombre,
      formData.lote,
      formData.fecha,
      formData.observaciones,
      nuevaRevision
    )
    
    setShowOverwriteModal(false)
    setOverwriteData(null)
  }

  const cancelarSobrescribir = () => {
    // Guardar los datos necesarios antes de limpiar
    if (overwriteData) {
      setPendingData({
        itemsEvaluados: overwriteData.itemsEvaluados,
        tieneIncidencia: overwriteData.tieneIncidencia
      })
    }
    setShowOverwriteModal(false)
    setOverwriteData(null)
    setShowNewNameModal(true)
    setNuevoNombre('')
  }

  const confirmarNuevoNombre = () => {
    if (!nuevoNombre.trim()) {
      alert('Por favor indicá un nombre para el nuevo lote')
      return
    }
    
    if (!pendingData) {
      alert('Error: datos pendientes no disponibles')
      setShowNewNameModal(false)
      return
    }
    
    const { itemsEvaluados, tieneIncidencia } = pendingData
    const nuevoLote = generarLoteAutomatico(partidas, formData.fecha)
    
    crearNuevaPartida(
      itemsEvaluados,
      tieneIncidencia,
      nuevoNombre,
      nuevoLote,
      formData.fecha,
      formData.observaciones,
      0
    )
    
    setShowNewNameModal(false)
    setNuevoNombre('')
    setPendingData(null)
  }

  const eliminarLotes = (lotesAEliminar) => {
    const nuevas = partidas.filter(p => !lotesAEliminar.includes(getLote(p)))
    setPartidas(nuevas)
    alert(`${lotesAEliminar.length} lote(s) eliminado(s) correctamente`)
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

  const ultimas30 = partidas.slice(0, 30)
  const conIncidencias = ultimas30.filter(p => p.tieneIncidencia).length

  const partidasFiltradas = partidas.filter(p => {
    const nombre = getNombre(p).toLowerCase()
    const lote = getLote(p).toLowerCase()
    return nombre.includes(busqueda.toLowerCase()) || lote.includes(busqueda.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-negro text-dorado">
      <header className="bg-gris-oscuro border-b border-terracota p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {vista !== 'checklist' && vista !== 'admin' && (
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

      <main className="max-w-4xl mx-auto p-4">
        {vista === 'checklist' && (
          <ChecklistView 
            formData={formData}
            setFormData={setFormData}
            checklistItems={checklistItems}
            handleItemCheck={handleItemCheck}
            guardarChecklist={guardarChecklist}
            setVista={setVista}
            nombreExiste={nombreExiste}
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
            partidas={partidas}
            eliminarLotes={eliminarLotes}
          />
        )}
      </main>

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

      {showOverwriteModal && overwriteData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gris-oscuro p-6 rounded-lg max-w-sm w-full border border-terracota">
            <AlertCircle className="text-terracota mx-auto mb-3" size={40} />
            <h2 className="text-xl font-bold mb-3 text-terracota text-center">Nombre existente</h2>
            <p className="text-center mb-4">
              ¿Querés sobrescribir el checklist de <strong className="text-dorado">{overwriteData.existente.nombre}</strong> (Lote {overwriteData.existente.lote})?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={confirmarSobrescribir}
                className="flex-1 bg-terracota py-2 rounded hover:bg-terracota/80 transition-colors font-bold"
              >
                Sí
              </button>
              <button 
                onClick={cancelarSobrescribir}
                className="flex-1 bg-negro border border-terracota py-2 rounded hover:bg-gris-oscuro transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewNameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gris-oscuro p-6 rounded-lg max-w-sm w-full border border-terracota">
            <h2 className="text-xl font-bold mb-4 text-terracota">Nuevo nombre</h2>
            <p className="mb-3 text-sm">Por favor indicá un nombre para el nuevo lote</p>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre de la partida"
              className="w-full p-3 mb-4 bg-negro border border-terracota rounded text-dorado"
              onKeyPress={(e) => e.key === 'Enter' && confirmarNuevoNombre()}
            />
            <div className="flex gap-2">
              <button 
                onClick={confirmarNuevoNombre}
                className="flex-1 bg-terracota py-2 rounded hover:bg-terracota/80 transition-colors"
              >
                Confirmar
              </button>
              <button 
                onClick={() => {
                  setShowNewNameModal(false)
                  setNuevoNombre('')
                  setPendingData(null)
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

function ChecklistView({ formData, setFormData, checklistItems, handleItemCheck, guardarChecklist, setVista, nombreExiste }) {
  const revisionTexto = formData.revision !== undefined && formData.revision > 0 
    ? ` - rev. ${formData.revision}` 
    : ''
  
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h2 className="text-xl font-bold mb-4 text-terracota">
          Nueva Partida {revisionTexto && <span className="text-dorado text-base">({revisionTexto.trim()})</span>}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Nombre de la partida</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={`w-full p-3 bg-negro border rounded text-dorado ${
                nombreExiste ? 'border-red-600' : 'border-terracota'
              }`}
              placeholder="Ej: Partida Espadín Octubre"
            />
            {nombreExiste && (
              <p className="text-xs text-red-500 mt-1">⚠️ Este nombre ya existe. Se te preguntará si querés sobrescribir al guardar.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm mb-2">Lote (automático)</label>
            <input
              type="text"
              value={formData.lote}
              readOnly
              className="w-full p-3 bg-negro border border-dorado/30 rounded text-dorado/60 cursor-not-allowed"
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
        <h2 className="text-xl font-bold mb-4 text-terracota">
          Checklist {revisionTexto}
        </h2>
        
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
            placeholder="Buscar por nombre o lote..."
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
              <div className="flex-1">
                <h3 className="font-bold text-terracota">
                  {getNombre(partida)}
                  {partida.revision > 0 && (
                    <span className="ml-2 text-xs text-dorado/70">- rev. {partida.revision}</span>
                  )}
                </h3>
                <p className="text-sm text-dorado/70">Lote: {getLote(partida)}</p>
                <p className="text-sm text-dorado/70">Fecha: {formatearFecha(partida.fecha)}</p>
              </div>
              {partida.tieneIncidencia && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  CON INCIDENCIA
                </span>
              )}
            </div>
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
        <h2 className="text-xl font-bold mb-4 text-terracota">
          {getNombre(partida)}
          {partida.revision > 0 && (
            <span className="ml-2 text-base text-dorado/70">- rev. {partida.revision}</span>
          )}
        </h2>
        <div className="space-y-2">
          <p className="flex justify-between">
            <span className="text-dorado/70">Lote:</span>
            <span className="font-bold">{getLote(partida)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-dorado/70">Fecha:</span>
            <span className="font-bold">{formatearFecha(partida.fecha)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-dorado/70">ID:</span>
            <span className="font-bold">{partida.id}</span>
          </p>
        </div>
      </div>

      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <h3 className="text-lg font-bold mb-4 text-terracota">
          Checklist {partida.revision > 0 && <span className="text-base text-dorado/70">- rev. {partida.revision}</span>}
        </h3>
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

function AdminView({ checklistItems, handleSaveItems, setVista, partidas, eliminarLotes }) {
  const [items, setItems] = useState([...checklistItems])
  const [nuevoItem, setNuevoItem] = useState('')
  const [modoBorrado, setModoBorrado] = useState(false)
  const [lotesSeleccionados, setLotesSeleccionados] = useState([])
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

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

  const toggleLote = (lote) => {
    setLotesSeleccionados(prev => 
      prev.includes(lote) 
        ? prev.filter(l => l !== lote)
        : [...prev, lote]
    )
  }

  const confirmarBorrado = () => {
    if (lotesSeleccionados.length === 0) {
      alert('Seleccioná al menos un lote para eliminar')
      return
    }
    setShowConfirmDelete(true)
  }

  const ejecutarBorrado = () => {
    eliminarLotes(lotesSeleccionados)
    setLotesSeleccionados([])
    setModoBorrado(false)
    setShowConfirmDelete(false)
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gris-oscuro p-4 rounded-lg border border-terracota">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-terracota">Administración</h2>
          <button
            onClick={() => {
              setModoBorrado(!modoBorrado)
              setLotesSeleccionados([])
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold ${
              modoBorrado 
                ? 'bg-red-600 text-white' 
                : 'bg-terracota text-white hover:bg-terracota/80'
            }`}
          >
            <Trash2 size={16} />
            {modoBorrado ? 'Cancelar borrado' : 'Borrar lotes'}
          </button>
        </div>

        {modoBorrado ? (
          <div>
            <p className="text-sm mb-3 text-dorado/80">Marcá los lotes que querés eliminar:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {partidas.map((partida) => (
                <div 
                  key={partida.id}
                  onClick={() => toggleLote(getLote(partida))}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer border ${
                    lotesSeleccionados.includes(getLote(partida))
                      ? 'bg-red-900/30 border-red-600'
                      : 'bg-negro border-dorado/30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    lotesSeleccionados.includes(getLote(partida))
                      ? 'bg-red-600 border-red-600'
                      : 'border-dorado'
                  }`}>
                    {lotesSeleccionados.includes(getLote(partida)) && <X size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{getNombre(partida)}</p>
                    <p className="text-xs text-dorado/70">Lote: {getLote(partida)} - {formatearFecha(partida.fecha)}</p>
                  </div>
                  {partida.tieneIncidencia && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">INC</span>
                  )}
                </div>
              ))}
            </div>
            
            {lotesSeleccionados.length > 0 && (
              <p className="text-sm mb-3">
                <span className="text-terracota font-bold">{lotesSeleccionados.length}</span> lote(s) seleccionado(s)
              </p>
            )}
            
            <button
              onClick={confirmarBorrado}
              disabled={lotesSeleccionados.length === 0}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                lotesSeleccionados.length > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-negro border border-dorado/30 text-dorado/40 cursor-not-allowed'
              }`}
            >
              Eliminar seleccionados
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold mb-3 text-terracota">Ítems del Checklist</h3>
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
        )}
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gris-oscuro p-6 rounded-lg max-w-sm w-full border border-red-600">
            <AlertCircle className="text-red-600 mx-auto mb-3" size={40} />
            <h2 className="text-xl font-bold mb-3 text-red-600 text-center">Confirmar eliminación</h2>
            <p className="text-center mb-4">
              ¿Estás seguro de eliminar <strong className="text-dorado">{lotesSeleccionados.length}</strong> lote(s)? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={ejecutarBorrado}
                className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700 transition-colors font-bold"
              >
                Sí, eliminar
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
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

export default App
