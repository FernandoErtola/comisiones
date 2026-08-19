import React, { useState, useEffect } from 'react';
import {
  Copy,
  Trash2,
  Inbox,
  Clock,
  Home,
  TrendingUp,
  Building2,
  ShoppingCart,
  Percent,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { obtenerHistorial, eliminarCalculo, limpiarHistorial } from '../services/api';
import { formatearMiles } from '../utils/formatters';
import '../styles/Historial.css';

const Historial = ({ refresh }) => {
  const [historial, setHistorial] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [toast, setToast] = useState('');
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    operacion: 'todas',
    mes: 'todos',
    propiedad: 'todas'
  });

  useEffect(() => {
    cargarHistorial();
  }, [refresh]);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, filtros]);

  const cargarHistorial = async () => {
    try {
      const data = await obtenerHistorial();
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...historial];
    if (!resultado) return;

    // Filtrar por operación
    if (filtros.operacion !== 'todas') {
      resultado = resultado.filter(item => item.operacion.toLowerCase() === filtros.operacion.toLowerCase());
    }

    // Filtrar por mes
    if (filtros.mes !== 'todos') {
      resultado = resultado.filter(item => {
        if (!item.created_at) {
          return false;
        }
        // Se usa .replace para compatibilidad con Safari
        const fecha = new Date(item.created_at.replace(/-/g, '/'));
        if (isNaN(fecha.getTime())) return false;
        const mes = fecha.getMonth();
        return mes === parseInt(filtros.mes, 10);
      });
    }

    // Filtrar por propiedad
    if (filtros.propiedad !== 'todas') {
      resultado = resultado.filter(item => item.origen === filtros.propiedad);
    }

    setHistorialFiltrado(resultado);
  };

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      operacion: 'todas',
      mes: 'todos',
      propiedad: 'todas'
    });
  };

  const hayFiltrosActivos = () => {
    return filtros.operacion !== 'todas' || 
           filtros.mes !== 'todos' || 
           filtros.propiedad !== 'todas';
  };

  const copiarEntrada = (entrada) => {
    const texto = `${entrada.nombre}
Operación: ${entrada.operacion} | Propiedad: ${entrada.origen}
Valor: ${entrada.moneda} ${formatearMiles(entrada.valor)}
Comisión base: ${entrada.moneda} ${formatearMiles(entrada.comision_total)} (${entrada.pct_total.toFixed(1)}%)
Resultado según regla: ${entrada.texto_regla}`;

    navigator.clipboard.writeText(texto).then(() => {
      mostrarToast('Copiado al portapapeles');
    });
  };

  const borrarEntrada = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cálculo?')) return;
    
    try {
      await eliminarCalculo(id);
      mostrarToast('Cálculo eliminado');
      cargarHistorial();
    } catch (error) {
      console.error('Error al borrar:', error);
      mostrarToast('Error al eliminar');
    }
  };

  const limpiarTodo = async () => {
    if (!confirm('¿Estás seguro de borrar todo el historial? Esta acción no se puede deshacer.')) return;
    
    try {
      await limpiarHistorial();
      mostrarToast('Historial limpiado');
      cargarHistorial();
    } catch (error) {
      console.error('Error al limpiar:', error);
      mostrarToast('Error al limpiar historial');
    }
  };

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(''), 3000);
  };

  const getIconoOperacion = (operacion) => {
    return operacion === 'venta' ? <ShoppingCart size={14} /> : <Home size={14} />;
  };

  const getIconoOrigen = (origen) => {
    return <Building2 size={14} />;
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="historial-container">
      {/* Header */}
      <div className="hist-header">
        <p className="slabel">
          <Clock size={20} />
          Últimos cálculos
        </p>
        {historial.length > 0 && (
          <button className="hist-btn danger" onClick={limpiarTodo}>
            <Trash2 size={16} />
            Borrar todo
          </button>
        )}
      </div>

      {/* Filtros */}
      {historial.length > 0 && (
        <div className="hist-filters">
          <select
            className="filter-select filter-operacion"
            value={filtros.operacion}
            onChange={(e) => handleFiltroChange('operacion', e.target.value)}
          >
            <option value="todas">Toda Operación</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>

          <select
            className="filter-select filter-mes"
            value={filtros.mes}
            onChange={(e) => handleFiltroChange('mes', e.target.value)}
          >
            <option value="todos">Todos los Meses</option>
            {meses.map((mes, index) => (
              <option key={index} value={index}>{mes}</option>
            ))}
          </select>

          <select
            className="filter-select filter-propiedad"
            value={filtros.propiedad}
            onChange={(e) => handleFiltroChange('propiedad', e.target.value)}
          >
            <option value="todas">Toda Propiedad</option>
            <option value="Ita">Ita</option>
            <option value="Duprat">Duprat</option>
            <option value="Compartida">Compartida</option>
          </select>

          {hayFiltrosActivos() && (
            <button className="filter-clear" onClick={limpiarFiltros}>
              <X size={16} />
              Limpiar
            </button>
          )}

          <div className="filter-badge">
            <Filter size={16} />
            <span className="filter-badge-number">{historialFiltrado.length}</span>
            {historialFiltrado.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>
      )}

      {/* Content */}
      {historialFiltrado.length === 0 ? (
        <div className="hist-empty">
          <div className="hist-empty-icon">
            <Inbox size={32} />
          </div>
          <div className="hist-empty-text">
            {historial.length === 0 
              ? 'Todavía no guardaste ningún cálculo'
              : 'No hay resultados con estos filtros'
            }
          </div>
          <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>
            {historial.length === 0
              ? 'Los cálculos que guardes aparecerán aquí'
              : 'Intenta cambiar los filtros para ver más resultados'
            }
          </p>
          {hayFiltrosActivos() && (
            <button 
              className="hist-btn" 
              onClick={limpiarFiltros}
              style={{ marginTop: '16px' }}
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        historialFiltrado.map((entrada) => (
          <div key={entrada.id} className="hist-item">
            {/* Top */}
            <div className="hist-top">
              <span className="hist-name">
                {entrada.nombre}
              </span>
              <span className="hist-date">
                <Calendar size={14} />
                {new Date(entrada.created_at).toLocaleDateString('es-AR')}
              </span>
            </div>

            {/* Tags */}
            <div className="hist-row">
              <span className="hist-tag tag-operacion">
                {getIconoOperacion(entrada.operacion)}
                {entrada.operacion === 'venta' ? 'Venta' : 'Alquiler'}
              </span>
              <span className="hist-tag tag-origen">
                {getIconoOrigen(entrada.origen)}
                {entrada.origen}
              </span>
              <span className="hist-tag tag-valor">
                <TrendingUp size={14} />
                {entrada.moneda} {formatearMiles(entrada.valor)}
              </span>
              <span className="hist-tag tag-pct">
                <Percent size={14} />
                {entrada.pct_total > 0 ? `${entrada.pct_total.toFixed(1)}%` : '—'}
              </span>
            </div>

            {/* Valor */}
            <div className="hist-val">{entrada.texto_regla}</div>

            {/* Actions */}
            <div className="hist-actions">
              <button className="hist-btn" onClick={() => copiarEntrada(entrada)}>
                <Copy size={16} />
                Copiar
              </button>
              <button className="hist-btn danger" onClick={() => borrarEntrada(entrada.id)}>
                <Trash2 size={16} />
                Borrar
              </button>
            </div>
          </div>
        ))
      )}

      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
};

export default Historial;
