// Endpoint para buscar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Busca os últimos 50 pedidos ordenados por data
    const [rows] = await conn.execute(`
      SELECT 
        NUMERO AS numero
      FROM ped_orc 
     
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
