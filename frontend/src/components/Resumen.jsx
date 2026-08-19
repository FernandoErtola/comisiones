import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, DollarSign, Banknote, TrendingUp, Hash, Download } from 'lucide-react';
import { obtenerHistorial } from '../services/api';
import { formatearMoneda } from '../utils/formatters';
import jsPDF from 'jspdf';

const Resumen = ({ refresh }) => {
  const [resumenData, setResumenData] = useState({});
  const [loading, setLoading] = useState(true);
  const [resumenAnual, setResumenAnual] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, [refresh]);

  const cargarResumen = async () => {
    setLoading(true);
    try {
      const historial = await obtenerHistorial();
      const dataProcesada = procesarDatos(historial);
      setResumenData(dataProcesada);
      setResumenAnual(calcularResumenAnual(dataProcesada));
    } catch (error) {
      console.error('Error al cargar el resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const procesarDatos = (historial) => {
    if (!historial || historial.length === 0) {
      return {};
    }

    const resumen = historial.reduce((acc, item) => {
      const fecha = new Date(item.created_at);
      if (isNaN(fecha.getTime())) { return acc; }

      const mesAnio = fecha.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
      const key = `${mesAnio.charAt(0).toUpperCase()}${mesAnio.slice(1)}`;

      if (!acc[key]) {
        acc[key] = {
          USD: { comisionTotal: 0, comisionRegla: 0, count: 0 },
          $: { comisionTotal: 0, comisionRegla: 0, count: 0 },
        };
      }

      const moneda = item.moneda === 'USD' ? 'USD' : '$';
      acc[key][moneda].comisionTotal += item.comision_total || 0;
      acc[key][moneda].comisionRegla += item.comision_regla || 0;
      acc[key][moneda].count += 1;

      return acc;
    }, {});

    return resumen;
  };

  const calcularResumenAnual = (data) => {
    if (Object.keys(data).length === 0) {
      return null;
    }

    const totalAnual = {
      USD: { comisionRegla: 0, count: 0 },
      $: { comisionRegla: 0, count: 0 },
    };

    Object.values(data).forEach(mesData => {
      totalAnual.USD.comisionRegla += mesData.USD.comisionRegla;
      totalAnual.USD.count += mesData.USD.count;
      totalAnual.$.comisionRegla += mesData.$.comisionRegla;
      totalAnual.$.count += mesData.$.count;
    });

    return totalAnual;
  };

  const mesesOrdenados = Object.keys(resumenData).sort((a, b) => {
    const [mesA, anioA] = a.split(' de ');
    const [mesB, anioB] = b.split(' de ');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return new Date(anioB, meses.indexOf(mesB.toLowerCase())) - new Date(anioA, meses.indexOf(mesA.toLowerCase()));
  });

  if (loading) {
    return <div className="resumen-container"><p>Cargando resumen...</p></div>;
  }

  const exportarResumenPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const fecha = new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // --color-primary
    doc.text('Resumen Mensual de Comisiones', 20, 25);

    // Línea decorativa
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);

    // Fecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Fecha de emisión: ' + fecha, 20, 38);

    let y = 50;

    // Resumen Anual en PDF
    if (resumenAnual) {
      const cardWidth = 170;
      let cardHeight = 15;
      if (resumenAnual['$'].count > 0) cardHeight += 15;
      if (resumenAnual['USD'].count > 0) cardHeight += 15;

      doc.setFillColor(239, 246, 255); // light-blue
      doc.setDrawColor(147, 197, 253); // blue
      doc.setLineWidth(0.5);
      doc.roundedRect(20, y, cardWidth, cardHeight, 5, 5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Resumen Anual Total', 25, y + 10);
      y += 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      if (resumenAnual['$'].count > 0) {
        doc.setTextColor(71, 85, 105);
        doc.text('Comisión Ita (ARS):', 25, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatearMoneda('$', resumenAnual['$'].comisionRegla), 100, y);
        y += 15;
      }
      if (resumenAnual['USD'].count > 0) {
        doc.setTextColor(71, 85, 105);
        doc.text('Comisión Ita (USD):', 25, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatearMoneda('USD', resumenAnual['USD'].comisionRegla), 100, y);
        y += 15;
      }
      y += 5;
    }

    y = 55; // Reasignamos 'y' para la sección de meses
    const cardWidth = 170;

    mesesOrdenados.forEach(mes => {
      const datosMes = resumenData[mes];
      let cardHeight = 15; // Padding top
      if (datosMes['$'].count > 0) cardHeight += 15;
      if (datosMes['USD'].count > 0) cardHeight += 15;

      if (y + cardHeight > 270) { // Simple page break
        doc.addPage();
        y = 25;
      }

      // Card background
      doc.setFillColor(248, 250, 252); // #f8fafc
      doc.setDrawColor(226, 232, 240); // --color-border-light
      doc.setLineWidth(0.5);
      doc.roundedRect(20, y, cardWidth, cardHeight, 5, 5, 'FD');

      // Título del mes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text(mes, 25, y + 10);
      y += 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      if (datosMes['$'].count > 0) {
        doc.setTextColor(71, 85, 105); // --color-text-secondary
        doc.text('Comisión Ita (ARS):', 25, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); // --color-text-primary
        doc.text(formatearMoneda('$', datosMes['$'].comisionRegla), 100, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`(${datosMes['$'].count} op.)`, 140, y);
        y += 15;
      }

      if (datosMes['USD'].count > 0) {
        doc.setTextColor(71, 85, 105); // --color-text-secondary
        doc.text('Comisión Ita (USD):', 25, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); // --color-text-primary
        doc.text(formatearMoneda('USD', datosMes['USD'].comisionRegla), 100, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`(${datosMes['USD'].count} op.)`, 140, y);
        y += 15;
      }
      y += 5; // Espacio entre cards
    });

    doc.save(`resumen_comisiones_${Date.now()}.pdf`);
  };

  return (
    <div className="resumen-container">
      <div className="resumen-header">
        <p className="slabel">
          <BarChart3 size={20} />
          Resumen Mensual
        </p>
        {mesesOrdenados.length > 0 && (
          <button className="hist-btn" onClick={exportarResumenPDF}>
            <Download size={16} />
            Exportar a PDF
          </button>
        )}
      </div>

      {resumenAnual && (
        <div className="resumen-mes-card resumen-anual-card">
          <h3 className="resumen-mes-title">
            <TrendingUp size={18} />
            Resumen Anual Total
          </h3>
          <div className="resumen-totales-container">
            {resumenAnual['$'].count > 0 && (
              <div className="resumen-metric">
                <span><Banknote size={14} /> Comisión Ita (ARS):</span>
                <strong>{formatearMoneda('$', resumenAnual['$'].comisionRegla)}</strong>
              </div>
            )}
            {resumenAnual['USD'].count > 0 && (
              <div className="resumen-metric">
                <span><DollarSign size={14} /> Comisión Ita (USD):</span>
                <strong>{formatearMoneda('USD', resumenAnual['USD'].comisionRegla)}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {mesesOrdenados.length === 0 ? (
        <div className="resumen-empty">
          <div className="resumen-empty-icon">
            <BarChart3 size={32} />
          </div>
          <div className="resumen-empty-text">No hay datos para mostrar</div>
          <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>
            Guarda algunos cálculos para ver el resumen mensual aquí.
          </p>
        </div>
      ) : (
        mesesOrdenados.map(mes => (
          <div key={mes} className="resumen-mes-card">
            <h3 className="resumen-mes-title">
              <Calendar size={18} />
              {mes}
            </h3>
            <div className="resumen-totales-container">
              {resumenData[mes]['$'].count > 0 && (
                <div className="resumen-metric">
                  <span><Banknote size={14} /> Comisión Ita (ARS):</span>
                  <strong>{formatearMoneda('$', resumenData[mes]['$'].comisionRegla)}</strong>
                  <span className="operaciones-count">({resumenData[mes]['$'].count} op.)</span>
                </div>
              )}
              {resumenData[mes]['USD'].count > 0 && (
                <div className="resumen-metric">
                  <span><DollarSign size={14} /> Comisión Ita (USD):</span>
                  <strong>{formatearMoneda('USD', resumenData[mes]['USD'].comisionRegla)}</strong>
                  <span className="operaciones-count">({resumenData[mes]['USD'].count} op.)</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Resumen;