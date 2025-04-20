import React from 'react'
import ReactDOM from 'react-dom/client'
import { NuiProvider } from './providers/NuiProvider'
import App from './App'
import './index.css'
import { DevTools } from './components/DevTools'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Disable StrictMode in FiveM to prevent double-mounting
  <NuiProvider>
    <App />
    {import.meta.env.DEV && <DevTools />}
  </NuiProvider>
) 