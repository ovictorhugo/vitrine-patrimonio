import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <script src="https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js" />
    <App />
  </React.StrictMode>
)
