// Endpoint simplificado para testar os dados
app.get('/pedidos-simples', async (req, res) => {
  let conn;
  
  try {
    conn = await mysql.createConnection(dbConfig);
    
    // Query mais simples sem formatação de data
    const [rows] = await conn.execute(`
      SELECT * FROM ped_orc 
      ORDER BY DATA DESC
      LIMIT 10
    `);
    
    console.log(`Pedidos simples encontrados: ${rows.length}`);
    
    res.json(rows);
    
  } catch (err) {
    console.error('Erro ao buscar pedidos simples:', err);
    res.status(500).json({ 
      error: 'Erro de servidor',
      message: err.message
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});
