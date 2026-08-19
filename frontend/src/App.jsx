import React, { useState } from 'react';
import { Calculator, Clock, Sparkles, BarChart3 } from 'lucide-react';
import Calculadora from './components/Calculadora';
import Historial from './components/Historial';
import Resumen from './components/Resumen';
import './styles/Resumen.css';
import './App.css';

function App() {
  const [tabActiva, setTabActiva] = useState('calc');
  const [refreshHistorial, setRefreshHistorial] = useState(0);

  const handleGuardado = () => {
    setRefreshHistorial(prev => prev + 1);
  };

  return (
    <div className="app">
      <div className="wrap">
        {/* Header */}
        <div className="app-header">
          <h1 className="app-title">
            <Sparkles size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Calculadora de Comisiones
          </h1>
          <p className="app-subtitle">Gestiona tus comisiones inmobiliarias de forma profesional</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${tabActiva === 'calc' ? 'active' : ''}`}
            onClick={() => setTabActiva('calc')}
          >
            <Calculator size={18} />
            <span>Calculadora</span>
          </button>
          <button
            className={`tab ${tabActiva === 'hist' ? 'active' : ''}`}
            onClick={() => setTabActiva('hist')}
          >
            <Clock size={18} />
            <span>Historial</span>
          </button>
          <button
            className={`tab ${tabActiva === 'resumen' ? 'active' : ''}`}
            onClick={() => setTabActiva('resumen')}
          >
            <BarChart3 size={18} />
            <span>Resumen</span>
          </button>
        </div>

        {/* Content */}
        <div className="content-container">
          {tabActiva === 'calc' && (
            <Calculadora onGuardado={handleGuardado} />
          )}
          {tabActiva === 'hist' && (
            <Historial refresh={refreshHistorial} />
          )}
          {tabActiva === 'resumen' && (
            <Resumen refresh={refreshHistorial} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
