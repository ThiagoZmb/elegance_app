// Endpoint para buscar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Busca os últimos 50 pedidos ordenados por data
    const [rows] = await conn.execute(`
      SELECT 
        NUMERO AS numero,
        RAZAO_SOCIAL AS cliente,
        CLIENTE_FINAL AS clienteFinal,
        DATE_FORMAT(DATA, '%d/%m/%Y') AS data,
        DATE_FORMAT(DATA_PRONTO, '%d/%m/%Y') AS prontoEm,
        TOTAL AS valor,
        OBS_GERAL AS observacao,
        SITUACAO AS situacao,
        FINANCEIRO AS financeiro,
        DATE_FORMAT(DATA_ENTREGA, '%d/%m/%Y') AS dataEntrega
      FROM ped_orc 
      ORDER BY DATA DESC
      LIMIT 50
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
