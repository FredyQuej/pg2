import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import ChatbotMCP from './ChatbotMCP'
import './styles.css'

const API_AUTH = import.meta.env.VITE_API_AUTH || 'http://localhost:4001'
const API_EVENTS = import.meta.env.VITE_API_EVENTS || 'http://localhost:4002'

function App(){
  const [token,setToken] = useState(localStorage.getItem('token')||'')
  const [email,setEmail] = useState('fquejq@miumg.edu.gt')
  const [password,setPassword] = useState('fr3dy')
  const [name,setName] = useState('fr3dyquej')
  const [repos,setRepos] = useState([])
  const [selectedRepo,setSelectedRepo] = useState('')
  const [events,setEvents] = useState([])
  const [notification,setNotification] = useState('')

  // === Registro / Login ===
  const register = async () => {
    const r = await fetch(`${API_AUTH}/auth/register`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email,password,name})
    })
    const j = await r.json()
    if (j.token){ localStorage.setItem('token', j.token); setToken(j.token) }
    alert(JSON.stringify(j))
  }

  const login = async () => {
    const r = await fetch(`${API_AUTH}/auth/login`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email,password})
    })
    const j = await r.json()
    if (j.token){ localStorage.setItem('token', j.token); setToken(j.token) }
    alert(JSON.stringify(j))
  }

  const loadRepos = async () => {
    const r = await fetch(`${API_EVENTS}/repos`)
    const j = await r.json()
    setRepos(j)
    if (j[0]) setSelectedRepo(j[0].id)
  }

  useEffect(()=>{ loadRepos() },[])

  // === Escuchar eventos GitHub ===
  useEffect(() => {
    console.log('🔌 Conectando a /events/stream...')
    const es = new EventSource('/events/stream')

    es.addEventListener('github', e => {
      const data = JSON.parse(e.data)
      const tipo = (data.event || 'push').toUpperCase()
      const repo = data.repo || 'desconocido'
      const fecha = new Date(data.at || Date.now()).toLocaleString('es-GT')

      const msg = `📢 ${tipo} detectado en ${repo}`
      setEvents(ev => [{tipo, repo, fecha}, ...ev].slice(0, 10))
      setNotification(msg)
      setTimeout(()=>setNotification(''), 5000)
    })

    es.onerror = (err) => console.warn('⚠️ Error SSE:', err)
    return ()=>es.close()
  }, [])

  return (
    <div className="app">
      {notification && (
        <div className="notification">{notification}</div>
      )}

      <div className="main">
        <header className="header-banner">
          <div className="brand">
            <div className="logo">WH</div>
            <div>
              <h1>Webhook Monitor</h1>
              <div className="subtitle">Proyecto de Graduación II — Monitor de webhooks</div>
            </div>
          </div>
          <div className="header-actions">
            {token ? (
              <div className="user">Autenticado</div>
            ) : (
              <div className="small-note">Conéctate para ver acciones privadas</div>
            )}
          </div>
        </header>

        {!token && (
          <div className="auth-controls">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
            <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="password"/>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="name"/>
            <button className="btn primary" onClick={register}>Registrarse</button>
            <button className="btn" onClick={login}>Login</button>
          </div>
        )}

        <section className="repos-section">
          <div className="repos-header">
            <h2>Repositorios</h2>
            <button className="btn" onClick={loadRepos}>Refrescar</button>
          </div>
          <div className="repos-controls">
            <select value={selectedRepo} onChange={e=>setSelectedRepo(e.target.value)}>
              <option value="">-- seleccionar --</option>
              {repos.map(r=> <option key={r.id} value={r.id}>{r.owner}/{r.name}</option>)}
            </select>
          </div>
          <p className="hint">Eventos recibidos en tiempo real se mostrarán en el panel derecho 👉</p>
        </section>
      </div>

      {/* Panel lateral de eventos */}
      <aside className="sidebar">
        <h3>Eventos recientes</h3>
        {events.length === 0 ? (
          <p className="empty">Aún no hay eventos</p>
        ) : (
          events.map((ev,i)=>(
            <div key={i} className="event-card">
              <div className="event-type"><b>{ev.tipo}</b></div>
              <div className="event-repo">{ev.repo}</div>
              <div className="event-time">{ev.fecha}</div>
            </div>
          ))
        )}
      </aside>

      {/* 👇 El nuevo Chat tipo Messenger */}
      {selectedRepo && <ChatbotMCP repoId={selectedRepo} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App/>)
