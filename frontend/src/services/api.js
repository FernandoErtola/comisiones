import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const calcularComision = async (datos) => {
  const response = await api.post('/calcular', datos);
  return response.data;
};

export const guardarCalculo = async (datos) => {
  const response = await api.post('/historial', datos);
  return response.data;
};

export const obtenerHistorial = async () => {
  const response = await api.get('/historial');
  return response.data;
};

export const eliminarCalculo = async (id) => {
  const response = await api.delete(`/historial/${id}`);
  return response.data;
};

export const limpiarHistorial = async () => {
  const response = await api.delete('/historial');
  return response.data;
};

export default api;
