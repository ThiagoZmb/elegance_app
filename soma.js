app.get('/pedidos', async (req, res) => {
  
  try {
    const conn = await mysql.createConnection(dbConfig);

   
    // 2. Consulta: soma do TOTAL no mês atual
    const [somaMes] = await conn.execute(`
      SELECT
        SUM(TOTAL) AS totalMesAtual
      FROM ped_orc
      WHERE
        MONTH(DATA) = MONTH(CURRENT_DATE())
        AND YEAR(DATA) = YEAR(CURRENT_DATE())
    `);

    await conn.end();

    // 3. Montagem do JSON de resposta
    res.json({
      totalMesAtual: somaMes[0].totalMesAtual || 0
    });

  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }

});
