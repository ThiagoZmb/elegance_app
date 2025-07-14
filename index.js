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
    const [rows] = await conn.execute(
      'SELECT * FROM cliente_usuarios WHERE nome = ? AND senha = ?',
      [username, password]
    );
    await conn.end();
    
    if (rows.length > 0) {
      // SOLUÇÃO DEFINITIVA PARA CASE SENSITIVITY
      const user = rows[0];
      const razao_social = user.RAZAO_SOCIAL || user.razao_social || user.Razao_Social;
      
      // Adicione logs para depuração
      console.log('Dados do usuário:', user);
      console.log('Razão social encontrada:', razao_social);
      
      res.json({ 
        success: true,
        razao_social: razao_social
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro de servidor' });
  }
});


