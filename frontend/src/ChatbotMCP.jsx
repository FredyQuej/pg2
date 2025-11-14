import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_MCP = import.meta.env.VITE_API_MCP || 'http://localhost:4020/mcp/rpc'
const MCP_API_KEY = import.meta.env.VITE_MCP_API_KEY || 'sistemasumgsecret'

function Message({ role, text }) {
  const isUser = role === 'user'
  const style = {
    maxWidth: '75%',
    padding: '10px 12px',
    borderRadius: 12,
    margin: '6px 0',
    whiteSpace: 'pre-wrap',
    background: isUser ? '#eaeaea' : '#e6f0ff',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  }
  return <div style={style}>{text}</div>
}

export default function ChatbotMCP({ repoId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hola 👋 Soy tu asistente. Pide: "estado de ramas", "buscar eventos", "generar reporte PDF".' }
  ])
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const scroller = useRef(null)

  useEffect(() => {
    if (scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])

    let rpc = null
    if (/reporte|pdf/i.test(text)) {
      if (!repoId)
        return setMessages(m => [...m, { role: 'assistant', text: 'Selecciona un repositorio para generar reporte.' }])
      rpc = { id: Date.now(), method: 'generateReport', params: { repoId } }
    } else if (/pendientes|estado/i.test(text)) {
      if (!repoId)
        return setMessages(m => [...m, { role: 'assistant', text: 'Selecciona un repositorio para consultar pendientes.' }])
      rpc = { id: Date.now(), method: 'getPendingChanges', params: { repoId } }
    } else if (/eventos|buscar|releases|push|pull/i.test(text)) {
      if (!repoId)
        return setMessages(m => [...m, { role: 'assistant', text: 'Selecciona un repositorio para buscar eventos.' }])
      rpc = { id: Date.now(), method: 'searchEvents', params: { repoId, page: 1, pageSize: 10 } }
    } else {
      rpc = {
        id: Date.now(),
        method: 'chat',
        params: {
          prompt: text,
          context: 'Eres un asistente para monitorear ramas y releases de un repositorio.'
        }
      }
    }

    try {
      const r = await fetch(API_MCP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MCP_API_KEY}`
        },
        body: JSON.stringify(rpc)
      })
      const j = await r.json()
      if (j.error)
        return setMessages(m => [...m, { role: 'assistant', text: `Error: ${j.error.message}` }])

      if (rpc.method === 'generateReport') {
        const { pdfBase64, filename } = j.result || {}
        if (pdfBase64) {
          const a = document.createElement('a')
          a.href = 'data:application/pdf;base64,' + pdfBase64
          a.download = filename || 'reporte.pdf'
          a.click()
          setMessages(m => [...m, { role: 'assistant', text: '📄 Reporte generado y descargado.' }])
        } else {
          setMessages(m => [...m, { role: 'assistant', text: 'No se pudo generar el reporte.' }])
        }
      } else if (rpc.method === 'getPendingChanges') {
        const list = j.result?.pending || []
        if (!list.length)
          setMessages(m => [...m, { role: 'assistant', text: 'No hay PRs pendientes hacia main/master.' }])
        else {
          const txt = list.map(p => `• PR #${p.number}: ${p.title} (${p.branch} → ${p.base})`).join('\n')
          setMessages(m => [...m, { role: 'assistant', text: 'Pendientes:\n' + txt }])
        }
      } else if (rpc.method === 'searchEvents') {
        const items = j.result?.items || []
        if (!items.length)
          setMessages(m => [...m, { role: 'assistant', text: 'No se encontraron eventos.' }])
        else {
          const lines = items.slice(0, 10).map(it =>
            it.type === 'pull_request'
              ? `PR #${it.number}: ${it.title} (${it.branch}→${it.base}) [${it.state}]`
              : it.type === 'release'
              ? `Release: ${it.name || '(sin nombre)'} tag=${it.tag || '-'}`
              : `Push: ${it.commits} commits en ${it.branch}`
          )
          setMessages(m => [...m, { role: 'assistant', text: lines.join('\n') }])
        }
      } else if (rpc.method === 'chat') {
        setMessages(m => [...m, { role: 'assistant', text: j.result?.text || '(sin respuesta)' }])
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: `Error de red: ${e.message}` }])
    }
  }

  return (
    <>
      {/* 💬 Ventana del Chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: 'spring', duration: 0.5 }}
            style={{
              position: 'fixed',
              right: 20,
              bottom: 80,
              width: 380,
              height: 520,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid #eee',
              background: '#007bff',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <b>Asistente IA (MCP)</b>
              <button 
                onClick={() => setOpen(false)} 
                style={{
                  background:'transparent',
                  border:'none',
                  color:'white',
                  fontSize:16,
                  cursor:'pointer'
                }}>✖</button>
            </div>

            <div ref={scroller} style={{
              flex:1,
              overflowY:'auto',
              padding:'10px 12px',
              background:'#fafafa',
              display:'flex',
              flexDirection:'column'
            }}>
              {messages.map((m,i)=><Message key={i} role={m.role} text={m.text}/>)}
            </div>

            <div style={{
              borderTop:'1px solid #eee',
              padding:8,
              display:'flex',
              gap:8
            }}>
              <input 
                style={{
                  flex:1, padding:'8px 10px', border:'1px solid #ccc', borderRadius:8
                }}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') send() }}
                placeholder="Escribe aquí..."
              />
              <button 
                onClick={send} 
                style={{
                  padding:'8px 12px', borderRadius:8, background:'#007bff', color:'#fff', border:'none'
                }}>Enviar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔘 Botón tipo burbuja (Messenger Style) */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          right: 25,
          bottom: 25,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: 26,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          zIndex: 10000
        }}
      >
        🤖
      </motion.button>
    </>
  )
}
