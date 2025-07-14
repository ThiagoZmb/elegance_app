// Endpoint para buscar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Busca os últimos 50 pedidos ordenados por data
    const [rows] = await conn.execute(`
      SELECT 
        id_orc AS numero,
        cliente AS cliente,
        cliente_final AS clienteFinal,
        DATE_FORMAT(data_orc, '%d/%m/%Y') AS data,
        DATE_FORMAT(data_pronto, '%d/%m/%Y') AS prontoEm,
        valor_total AS valor,
        observacao AS observacao,
        situacao AS situacao,
        financeiro AS financeiro,
        DATE_FORMAT(data_entrega, '%d/%m/%Y') AS dataEntrega
      FROM ped_orc 
      ORDER BY data_orc DESC
      LIMIT 50
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
