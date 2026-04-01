import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AsgardeoProvider } from '@asgardeo/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AsgardeoProvider
      clientId="ZruZXCG9deTmAkg3Um1r2LeB_aAa"
      baseUrl="https://api.asgardeo.io/t/abel"
      scopes="openid profile"
    >
      <App />
    </AsgardeoProvider>
  </StrictMode>
)
