import React, { useState, useEffect } from 'react';
import {
  Home,
  DollarSign,
  TrendingUp,
  Building2,
  Percent,
  Copy,
  Download,
  Save,
  Calculator as CalcIcon,
  Banknote,
  ShoppingCart,
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Upload  // Added Upload icon
} from 'lucide-react';
import { calcularComision, guardarCalculo } from '../services/api';
import { formatearMiles, formatearMoneda, limpiarNumero } from '../utils/formatters';
import { exportarPDF } from '../utils/pdfExport';
import '../styles/Calculadora.css';

const Calculadora = ({ onGuardado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    moneda: '$',
    valor: '',
    operacion: 'venta',
    origen: 'Ita',
    comisV: '',
    comisC: '',
    comisT: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const [resultado, setResultado] = useState({
    comisionTotal: 0,
    pctTotal: 0,
    comisionRegla: 0,
    textoRegla: '—',
  });

  const [toast, setToast] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    calcular();
  }, [formData]);

  const calcular = async () => {
    const valorNum = parseFloat(limpiarNumero(formData.valor)) || 0;
    if (valorNum === 0) {
      setResultado({
        comisionTotal: 0,
        pctTotal: 0,
        comisionRegla: 0,
        textoRegla: '—',
      });
      return;
    }

    try {
      const datos = {
        ...formData,
        valor: valorNum,
        comisV: parseFloat(formData.comisV) || 0,
        comisC: parseFloat(formData.comisC) || 0,
        comisT: parseFloat(formData.comisT) || 0,
      };

      const res = await calcularComision(datos);
      setResultado(res);
    } catch (error) {
      console.error('Error al calcular:', error);
      mostrarToast('Error al calcular');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'valor') {
      const limpio = limpiarNumero(value);
      const formateado = limpio ? formatearMiles(parseInt(limpio)) : '';
      setFormData(prev => ({ ...prev, [name]: formateado }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGuardar = async () => {
    const valorNum = parseFloat(limpiarNumero(formData.valor)) || 0;
    if (valorNum === 0) {
      mostrarToast('Ingresá un valor primero');
      return;
    }

    try {
      const datos = {
        nombre: formData.nombre || 'Sin nombre',
        moneda: formData.moneda,
        valor: valorNum,
        operacion: formData.operacion,
        origen: formData.origen,
        pctTotal: resultado.pctTotal,
        comisionTotal: resultado.comisionTotal,
        comisionRegla: resultado.comisionRegla,
        textoRegla: resultado.textoRegla,
        fecha: formData.fecha,
      };

      await guardarCalculo(datos);
      mostrarToast('Guardado en historial');
      if (onGuardado) onGuardado();
    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarToast('Error al guardar');
    }
  };

  const copiarResultado = () => {
    const valorNum = parseFloat(limpiarNumero(formData.valor)) || 0;
    if (valorNum === 0) {
      mostrarToast('Ingresá un valor primero');
      return;
    }

    const texto = `${formData.nombre || 'Sin nombre'}
Operación: ${formData.operacion} | Propiedad: ${formData.origen}
Valor: ${formatearMoneda(formData.moneda, valorNum)}
Comisión base: ${formatearMoneda(formData.moneda, resultado.comisionTotal)} (${resultado.pctTotal.toFixed(1)}%)
Resultado según regla: ${resultado.textoRegla}`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      mostrarToast('Copiado al portapapeles');
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(''), 3000);
  };

  const esCompartida = formData.origen === 'Compartida';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Aquí puedes implementar la lógica para procesar la imagen
      console.log('Archivo subido:', file);
      // Ejemplo: usar una librería de OCR para extraer texto
    }
  };

  return (
    <div className="calculadora-container">
      {/* Direccion y Fecha */}
      <div className="two">
        <div className="field">
          <label>
            <Home size={18} />
            Dirección del inmueble
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Depto 2 amb. Palermo"
          />
        </div>
        <div className="field">
          <label>
            <Calendar size={18} />
            Fecha de operación
          </label>
          <input
            type="date"
            name="fecha"
            className="date-input"
            value={formData.fecha}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Moneda */}
      <div className="field">
        <label>
          <DollarSign size={18} />
          Moneda
        </label>
        <div className="cur-row">
          <button
            className={`cur-btn ${formData.moneda === '$' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, moneda: '$' }))}
          >
            <span>
              <Banknote size={18} />
              $ Pesos
            </span>
          </button>
          <button
            className={`cur-btn ${formData.moneda === 'USD' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, moneda: 'USD' }))}
          >
            <span>
              <DollarSign size={18} />
              USD
            </span>
          </button>
        </div>
      </div>

      {/* Valor, Operación y Propiedad */}
      <div className="two">
        <div className="field">
          <label>
            <TrendingUp size={18} />
            Valor del inmueble
          </label>
          <input
            type="text"
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            placeholder="Ej: 150.000"
          />
        </div>
        <div className="field">
          <label>
            <Building2 size={18} />
            Propiedad de
          </label>
          <select name="origen" value={formData.origen} onChange={handleInputChange}>
            <option value="Ita">Ita</option>
            <option value="Duprat">Duprat</option>
            <option value="Compartida">Compartida</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>
          <ShoppingCart size={18} />
          Tipo de operación
        </label>
        <select name="operacion" value={formData.operacion} onChange={handleInputChange}>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
        </select>
      </div>

      {/* Comisiones */}
      {!esCompartida ? (
        <div className="two">
          <div className="field pct-wrap">
            <label>
              <Percent size={18} />
              Comisión vendedor
            </label>
            <input
              type="number"
              name="comisV"
              value={formData.comisV}
              onChange={handleInputChange}
              placeholder="3"
              min="0"
              max="99"
            />
          </div>
          <div className="field pct-wrap">
            <label>
              <Percent size={18} />
              Comisión comprador
            </label>
            <input
              type="number"
              name="comisC"
              value={formData.comisC}
              onChange={handleInputChange}
              placeholder="4"
              min="0"
              max="99"
            />
          </div>
        </div>
      ) : (
        <div className="field pct-wrap">
          <label>
            <Users size={18} />
            Comisión total
          </label>
          <input
            type="number"
            name="comisT"
            value={formData.comisT}
            onChange={handleInputChange}
            placeholder="6"
            min="0"
            max="99"
          />
        </div>
      )}

      {/* Divider */}
      <div className="divider"></div>

      {/* Subida de Archivos */}
      <div className="field">
        <label>
          <Upload size={18} />
          Subir Archivo
        </label>
        <input type="file" onChange={handleFileUpload} />
      </div>

      {/* Resultado */}
      <p className="slabel">
        <CalcIcon size={16} />
        Resultado
      </p>

      <div className="metrics">
        <div className="metric">
          <div className="metric-lbl">
            <DollarSign size={14} />
            Comisión base total
          </div>
          <div className="metric-val">
            {resultado.comisionTotal > 0 ? formatearMoneda(formData.moneda, resultado.comisionTotal) : '—'}
          </div>
        </div>
        <div className="metric">
          <div className="metric-lbl">
            <Percent size={14} />
            Porcentaje total
          </div>
          <div className="metric-val">
            {resultado.pctTotal > 0 ? `${resultado.pctTotal.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Regla card */}
      <div className="regla-card">
        <div className="regla-icon">
          <Award size={24} />
        </div>
        <div className="regla-content">
          <div className="regla-lbl">Comisión para Ita</div>
          <div className="regla-val">{resultado.textoRegla}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-row">
        <button 
          className={`action-btn ${copiado ? 'success' : ''}`} 
          onClick={copiarResultado}
        >
          <span>
            {copiado ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copiado ? 'Copiado' : 'Copiar'}
          </span>
        </button>
        <button className="action-btn" onClick={() => exportarPDF(formData, resultado)}>
          <span>
            <Download size={18} />
            Exportar PDF
          </span>
        </button>
      </div>

      {/* Save button */}
      <button className="save-btn" onClick={handleGuardar}>
        <span>
          <Save size={20} />
          Guardar en historial
        </span>
      </button>

      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
};

export default Calculadora;
