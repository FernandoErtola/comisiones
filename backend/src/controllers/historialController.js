const supabase = require('../config/supabase');

const guardarCalculo = async (req, res) => {
  try {
    const { nombre, moneda, valor, operacion, origen, pctTotal, comisionTotal, comisionRegla, textoRegla } = req.body;

    const { data, error } = await supabase
      .from('historial_comisiones')
      .insert([
        {
          nombre,
          moneda,
          valor,
          operacion,
          origen,
          pct_total: pctTotal,
          comision_total: comisionTotal,
          comision_regla: comisionRegla,
          texto_regla: textoRegla,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error al guardar en historial' });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('historial_comisiones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

const eliminarCalculo = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('historial_comisiones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error al eliminar cálculo' });
  }
};

const limpiarHistorial = async (req, res) => {
  try {
    const { error } = await supabase
      .from('historial_comisiones')
      .delete()
      .neq('id', 0); // Elimina todos los registros

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error al limpiar:', error);
    res.status(500).json({ error: 'Error al limpiar historial' });
  }
};

module.exports = {
  guardarCalculo,
  obtenerHistorial,
  eliminarCalculo,
  limpiarHistorial,
};
