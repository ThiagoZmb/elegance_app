const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Use variáveis de ambiente em produção
const dbConfig = {
  host: process.env.DB_HOST || 'db-elegance-v4.mysql.uhserver.com',
  user: process.env.DB_USER || 'tfz',
  password: process.env.DB_PASS || '@04t28b03p',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'db_elegance_v4'
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Modifique a query para retornar o nome da empresa
    const [rows] = await conn.execute(
      'SELECT razao_social FROM cliente_usuarios WHERE nome = ? AND senha = ?',
      [username, password]
    );
    await conn.end();
    
    if (rows.length > 0) {
      // Retorne o nome da empresa no response
      res.json({ 
        success: true,
        empresa: rows[0].razao_social // Supondo que a coluna se chama "razao_social"
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ success: false, error: 'Erro de servidor' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
