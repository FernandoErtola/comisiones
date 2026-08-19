const calcularComision = (req, res) => {
  try {
    const { valor, moneda, origen, comisV, comisC, comisT } = req.body;

    let comisionTotal = 0;
    let comisionRegla = 0;
    let textoRegla = '—';
    let pctTotal = 0;

    if (origen === 'Compartida') {
      pctTotal = comisT;
      comisionTotal = valor * (comisT / 100);
      comisionRegla = comisionTotal;
      textoRegla = `${moneda} ${Math.round(comisionRegla).toLocaleString('de-DE')} (50% c/u)`;
    } else {
      pctTotal = comisV + comisC;
      comisionTotal = valor * (pctTotal / 100);
      
      if (origen === 'Ita') {
        comisionRegla = comisionTotal * 0.50;
        textoRegla = `${moneda} ${Math.round(comisionRegla).toLocaleString('de-DE')} (50% del total)`;
      } else {
        comisionRegla = comisionTotal * 0.075;
        textoRegla = `${moneda} ${Math.round(comisionRegla).toLocaleString('de-DE')} (7.5% del total)`;
      }
    }

    res.json({
      comisionTotal,
      pctTotal,
      comisionRegla,
      textoRegla,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular comisión' });
  }
};

module.exports = { calcularComision };
