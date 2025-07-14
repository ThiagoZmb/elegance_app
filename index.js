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

// VERSÃO MAIS SIMPLES: Força o retorno mesmo que seja NULL
app.post('/login-simple', async (req, res) => {
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
      
      // Tenta todas as possibilidades e retorna o primeiro valor encontrado
      const razao_social = 
        user.RAZAO_SOCIAL || 
        user.razao_social || 
        user.Razao_Social ||
        user.EMPRESA ||
        user.empresa ||
        user.NOME_EMPRESA ||
        user.nome_empresa ||
        user.NOME_FANTASIA ||
        user.nome_fantasia ||
        user.RAZAOSOCIAL ||
        user.razaosocial ||
        user.NOME || // usa o nome como fallback
        'Empresa não informada';
      
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


