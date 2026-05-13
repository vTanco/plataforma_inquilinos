import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="105035380421-9jcph3rp9qug6d4slbrlledptjm2er90.apps.googleusercontent.com">
      <PayPalScriptProvider options={{ clientId: "AeDDobUtJao6wEW0hzoKMvCOujVofou-b7yF58auEUISR7Rc2fNrQMQTZIUtyjmzaurSHZvJgG_g8bz6", currency: "EUR", intent: "capture", components: "buttons" }}>
        <App />
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
