const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS (apenas uma vez)
app.use(cors({
  origin: ['https://thiagozmb.github.io']
}));

app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'db-elegance-v4.mysql.uhserver.com',
  user: process.env.DB_USER || 'tfz',
  password: process.env.DB_PASS || '@04t28b03p',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'db_elegance_v4'
};

// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM cliente_usuarios WHERE NOME = ? AND SENHA = ?',
      [username, password]
    );
    await conn.end();
    
    if (rows.length > 0) {
      const user = rows[0];
      res.json({ 
        success: true, 
        user: {
          nome: user.NOME,
          empresa: user.RAZAO_SOCIAL
        }
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro de servidor' });
  }
}); // ← FECHAMENTO DO ENDPOINT LOGIN (estava faltando)










// Endpoint para buscar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    const [rows] = await conn.execute(`
      SELECT 
        RAZAO_SOCIAL AS razaosocial
      FROM ped_orc 
      WHERE NUMERO='22570'
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});




// Endpoint para buscar dados dos pedidos
app.get('/dados_pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Query para buscar os pedidos
    const [rows] = await conn.execute(`
      SELECT 
        p.NUMERO as numero,
        p.RAZAO_SOCIAL as cliente,
        p.CLIENTE_FINAL as clienteFinal,
        DATE_FORMAT(p.DATA, '%d/%m/%Y') as data,
        DATE_FORMAT(p.DATA_PRONTO, '%d/%m/%Y') as prontoEm,
        p.TOTAL as valor,
        p.OBS_GERAL as observacao,
        p.SITUACAO as situacao,
        p.FINANCEIRO as financeiro,
        DATE_FORMAT(p.DATA_ENTREGA, '%d/%m/%Y') as dataEntrega
      FROM ped_orc p
      //LEFT JOIN cadastro_clientes c ON p.RAZAO_SOCIAL = c.RAZAO_SOCIAL
      //ORDER BY p.DATA DESC, p.NUMERO DESC
     
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
