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
      'SELECT * FROM cliente_usuarios WHERE NOME = ? AND SENHA = ?',
      [username, password]
    );
    await conn.end();
    
    if (rows.length > 0) {
      const user = rows[0];
      
      // SOLUÇÃO DEFINITIVA: Função que nunca retorna undefined
      function getRazaoSocial(userObj) {
        // Lista de possíveis campos
        const possibleFields = [
          'RAZAO_SOCIAL',
          'razao_social', 
          'Razao_Social',
          'EMPRESA',
          'empresa',
          'NOME_EMPRESA',
          'nome_empresa',
          'NOME_FANTASIA',
          'nome_fantasia',
          'RAZAOSOCIAL',
          'razaosocial'
        ];
        
        // Procura um campo que tenha valor válido
        for (const field of possibleFields) {
          const value = userObj[field];
          if (value !== null && value !== undefined && value !== '') {
            return String(value).trim();
          }
        }
        
        // Se não encontrou nenhum campo específico, procura por qualquer campo
        // que contenha palavras relacionadas
        for (const key in userObj) {
          if (userObj.hasOwnProperty(key)) {
            const keyLower = key.toLowerCase();
            const value = userObj[key];
            
            if ((keyLower.includes('razao') || keyLower.includes('social') || keyLower.includes('empresa')) 
                && value !== null && value !== undefined && value !== '') {
              return String(value).trim();
            }
          }
        }
        
        // Como último recurso, usa o NOME do usuário
        const nome = userObj.NOME || userObj.nome;
        if (nome !== null && nome !== undefined && nome !== '') {
          return String(nome).trim();
        }
        
        // Se nem o nome tem, retorna uma string padrão
        return 'Não informado';
      }
      
      const razao_social = getRazaoSocial(user);
      
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

// VERSÃO AINDA MAIS SIMPLES - COM VERIFICAÇÃO EXPLÍCITA
app.post('/login-safe', async (req, res) => {
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
      
      // Função que verifica se o valor é válido
      function isValidValue(value) {
        return value !== null && value !== undefined && value !== '' && value !== 'null';
      }
      
      // Tenta cada campo um por vez
      let razao_social = '';
      
      if (isValidValue(user.RAZAO_SOCIAL)) {
        razao_social = String(user.RAZAO_SOCIAL).trim();
      } else if (isValidValue(user.razao_social)) {
        razao_social = String(user.razao_social).trim();
      } else if (isValidValue(user.Razao_Social)) {
        razao_social = String(user.Razao_Social).trim();
      } else if (isValidValue(user.EMPRESA)) {
        razao_social = String(user.EMPRESA).trim();
      } else if (isValidValue(user.empresa)) {
        razao_social = String(user.empresa).trim();
      } else if (isValidValue(user.NOME_EMPRESA)) {
        razao_social = String(user.NOME_EMPRESA).trim();
      } else if (isValidValue(user.nome_empresa)) {
        razao_social = String(user.nome_empresa).trim();
      } else if (isValidValue(user.NOME_FANTASIA)) {
        razao_social = String(user.NOME_FANTASIA).trim();
      } else if (isValidValue(user.nome_fantasia)) {
        razao_social = String(user.nome_fantasia).trim();
      } else if (isValidValue(user.NOME)) {
        razao_social = String(user.NOME).trim();
      } else if (isValidValue(user.nome)) {
        razao_social = String(user.nome).trim();
      } else {
        razao_social = 'Não informado';
      }
      
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

// VERSÃO COM FALLBACK GARANTIDO
app.post('/login-guaranteed', async (req, res) => {
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
      
      // Converte undefined/null para string vazia e depois aplica fallback
      const razao_social = (
        user.RAZAO_SOCIAL || 
        user.razao_social || 
        user.Razao_Social ||
        user.EMPRESA ||
        user.empresa ||
        user.NOME_EMPRESA ||
        user.nome_empresa ||
        user.NOME_FANTASIA ||
        user.nome_fantasia ||
        user.NOME ||
        user.nome ||
        'Não informado'
      ).toString().trim() || 'Não informado';
      
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

// VERSÃO MAIS DIRETA - USANDO COALESCE NO SQL
app.post('/login-sql', async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(`
      SELECT 
        *,
        COALESCE(
          NULLIF(RAZAO_SOCIAL, ''),
          NULLIF(razao_social, ''),
          NULLIF(Razao_Social, ''),
          NULLIF(EMPRESA, ''),
          NULLIF(empresa, ''),
          NULLIF(NOME_EMPRESA, ''),
          NULLIF(nome_empresa, ''),
          NULLIF(NOME_FANTASIA, ''),
          NULLIF(nome_fantasia, ''),
          NULLIF(NOME, ''),
          NULLIF(nome, ''),
          'Não informado'
        ) as razao_social_final
      FROM cliente_usuarios 
      WHERE NOME = ? AND SENHA = ?
    `, [username, password]);
    
    await conn.end();
    
    if (rows.length > 0) {
      const user = rows[0];
      
      res.json({ 
        success: true,
        razao_social: user.razao_social_final || 'Não informado'
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro de servidor' });
  }
});
