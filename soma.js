app.get('/api/pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
   
    // 2. Consulta: soma do TOTAL no mês atual
    const [somaMes] = await conn.execute(`
      SELECT
        SUM(TOTAL) AS totalMesAtual
      FROM ped_orc
      
    `);
    
    await conn.end();
    //WHERE
    //MONTH(DATA) = MONTH(CURRENT_DATE())
    //AND YEAR(DATA) = YEAR(CURRENT_DATE())

    
    const totalMesAtual = somaMes[0].totalMesAtual || 0;
    
    // Console.log ANTES de enviar a resposta
    console.log('Total do mês atual:', totalMesAtual);
    
    // 3. Montagem do JSON de resposta
    res.json({
      totalMesAtual: totalMesAtual
    });
    
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
