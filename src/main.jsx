import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Buffer } from 'buffer'
// Make Buffer available globally for mdb-reader's dependencies (cipher-base, readable-stream)
globalThis.Buffer = globalThis.Buffer || Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
