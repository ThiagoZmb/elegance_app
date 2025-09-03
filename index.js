app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'db-elegance-v4.mysql.uhserver.com',
  user: process.env.DB_USER || 'tfz',
  password: process.env.DB_PASS || '@04t28b03p',
  port: process.env.DB_PORT || '3306',
  database: process.env.DB_NAME || 'db_elegance_v4'
};

const usuario = null;

// Endpoint de login modificado
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
      // Login válido - retorna sucesso com dados do usuário
      res.json({ 
        success: true,
        console.log('Login realizado com sucesso !!!')
      });
    } else {
      // Credenciais inválidas
      res.json({ 
        success: false, 
        message: 'Usuário ou senha inválidos.' 
        
      });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro de servidor',
      message: 'Erro interno do servidor. Tente novamente.' 
    });
  }
});
