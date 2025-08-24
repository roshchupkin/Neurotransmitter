import React from 'react'
import ReactDOM from 'react-dom/client'
import NeurotransmitterGame from '../neurotransmitter_game.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NeurotransmitterGame />
  </React.StrictMode>,
)
