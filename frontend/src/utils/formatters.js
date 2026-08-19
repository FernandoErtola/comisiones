export const formatearMiles = (numero) => {
  return Math.round(numero).toLocaleString('de-DE');
};

export const formatearMoneda = (moneda, valor) => {
  return `${moneda} ${formatearMiles(valor)}`;
};

export const limpiarNumero = (texto) => {
  return texto.replace(/\./g, '').replace(/[^0-9]/g, '');
};
