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
