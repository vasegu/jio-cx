import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// StrictMode removed — it double-mounts components in dev,
// which kills the persistent WebSocket to Gemini Live API.
// Re-enable once we move to LiveKit (handles reconnection natively).
createRoot(document.getElementById('root')).render(
  <App />,
)
