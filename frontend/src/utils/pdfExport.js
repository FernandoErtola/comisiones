import jsPDF from 'jspdf';
import { formatearMiles, formatearMoneda, limpiarNumero } from './formatters';

export const exportarPDF = (formData, resultado) => {
  const valorNum = parseFloat(limpiarNumero(formData.valor)) || 0;

  if (valorNum === 0) {
    alert('Ingresá un valor primero');
    return;
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fecha = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Título principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text('Liquidación de Comisión', 20, 25);

  // Línea decorativa
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, 30, 190, 30);

  // Fecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Fecha de emisión: ' + fecha, 20, 38);

  // Información del inmueble
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Información del Inmueble', 20, 50);

  const rows = [
    ['Inmueble', formData.nombre || 'Sin nombre'],
    ['Operación', formData.operacion.charAt(0).toUpperCase() + formData.operacion.slice(1)],
    ['Propiedad de', formData.origen],
    ['Moneda', formData.moneda === '$' ? 'Pesos Argentinos (ARS)' : 'Dólares Estadounidenses (USD)'],
    ['Valor del inmueble', formatearMoneda(formData.moneda, valorNum)],
  ];

  let y = 58;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, y - 5, 174, 10, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label + ':', 22, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), 90, y);
    y += 12;
  });

  // Cálculo de comisiones
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Cálculo de Comisiones', 20, y);

  y += 8;
  const comisionRows = [
    ['Porcentaje total', resultado.pctTotal.toFixed(1) + '%'],
    ['Comisión base total', formatearMoneda(formData.moneda, resultado.comisionTotal)],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  comisionRows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, y - 5, 174, 10, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label + ':', 22, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), 90, y);
    y += 12;
  });

  // Resultado según regla (destacado)
  y += 8;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.5);
  doc.roundedRect(18, y - 8, 174, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175);
  doc.text('RESULTADO SEGÚN REGLA:', 22, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(12, 74, 110);
  doc.text(resultado.textoRegla, 22, y + 8);

  // Footer
  y += 30;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Documento generado automáticamente por Calculadora de Comisiones Inmobiliarias', 20, y + 6);
  doc.text('Este documento es informativo y no constituye un documento legal vinculante.', 20, y + 11);

  // Guardar
  const nombreArchivo = (formData.nombre || 'Sin_nombre').replace(/\s+/g, '_').substring(0, 30);
  doc.save(`comision_${nombreArchivo}_${Date.now()}.pdf`);
};
