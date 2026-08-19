const express = require('express');
const router = express.Router();
const { calcularComision } = require('../controllers/calculadoraController');
const {
  guardarCalculo,
  obtenerHistorial,
  eliminarCalculo,
  limpiarHistorial,
} = require('../controllers/historialController');

router.post('/calcular', calcularComision);
router.post('/historial', guardarCalculo);
router.get('/historial', obtenerHistorial);
router.delete('/historial/:id', eliminarCalculo);
router.delete('/historial', limpiarHistorial);

module.exports = router;
