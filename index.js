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

// Endpoint de login com debug melhorado
app.post('/login', async (req, res) => {
  console.log('=== INÍCIO DO LOGIN ===');
  console.log('Body recebido:', req.body);
  
  const { username, password } = req.body;
  
  // Verificar se os dados foram enviados
  if (!username || !password) {
    console.log('Erro: Username ou password não fornecidos');
    return res.status(400).json({ 
      success: false, 
      error: 'Username e password são obrigatórios' 
    });
  }
  
  console.log('Username:', username);
  console.log('Password:', password ? '***' : 'vazio');
  
  let conn;
  try {
    console.log('Tentando conectar ao banco...');
    console.log('Config do banco:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    conn = await mysql.createConnection(dbConfig);
    console.log('Conexão com banco estabelecida');
    
    console.log('Executando query...');
    const [rows] = await conn.execute(
      'SELECT * FROM cliente_usuarios WHERE NOME = ? AND SENHA = ?',
      [username, password]
    );
    
    console.log('Query executada. Resultados encontrados:', rows.length);
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('Usuário encontrado:', {
        nome: user.NOME,
        razaoSocial: user.RAZAO_SOCIAL
      });
      
      res.json({ 
        success: true, 
        user: {
          nome: user.NOME,
          empresa: user.RAZAO_SOCIAL
        }
      });
    } else {
      console.log('Nenhum usuário encontrado com essas credenciais');
      res.json({ success: false, error: 'Credenciais inválidas' });
    }
    
  } catch (err) {
    console.error('ERRO DETALHADO NO LOGIN:');
    console.error('Mensagem:', err.message);
    console.error('Stack:', err.stack);
    console.error('Code:', err.code);
    console.error('SQL State:', err.sqlState);
    
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (conn) {
      try {
        await conn.end();
        console.log('Conexão com banco fechada');
      } catch (closeErr) {
        console.error('Erro ao fechar conexão:', closeErr);
      }
    }
    console.log('=== FIM DO LOGIN ===');
  }
});

// Também adicione middleware para debug geral
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware para tratar erros não capturados
app.use((err, req, res, next) => {
  console.error('Erro não capturado:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erro interno do servidor' 
  });
});

// Verifique se você tem o middleware para parsing do body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Teste de conexão com o banco (adicione esta rota para testar)
app.get('/test-db', async (req, res) => {
  let conn;
  try {
    console.log('Testando conexão com banco...');
    conn = await mysql.createConnection(dbConfig);
    console.log('Conexão estabelecida');
    
    const [rows] = await conn.execute('SELECT 1 as test');
    console.log('Query teste executada:', rows);
    
    res.json({ success: true, message: 'Banco conectado com sucesso' });
  } catch (err) {
    console.error('Erro na conexão com banco:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

// Verificação da tabela (adicione esta rota para testar)
app.get('/test-table', async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    
    // Verifica se a tabela existe e mostra sua estrutura
    const [tables] = await conn.execute(
      "SHOW TABLES LIKE 'cliente_usuarios'"
    );
    
    if (tables.length === 0) {
      return res.json({ 
        success: false, 
        error: 'Tabela cliente_usuarios não encontrada' 
      });
    }
    
    // Mostra estrutura da tabela
    const [structure] = await conn.execute(
      'DESCRIBE cliente_usuarios'
    );
    
    // Conta registros
    const [count] = await conn.execute(
      'SELECT COUNT(*) as total FROM cliente_usuarios'
    );
    
    res.json({ 
      success: true,
      tableExists: true,
      structure: structure,
      totalRecords: count[0].total
    });
    
  } catch (err) {
    console.error('Erro ao verificar tabela:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});




// Endpoint de dados dos pedidos com filtro automático
app.get('/dados_pedidos', requireLogin, async (req, res) => {
  try {
    const empresa = req.session.user.empresa;
    
    const conn = await mysql.createConnection(dbConfig);
    
    // Query para buscar os pedidos filtrados pela empresa do usuário logado
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
      WHERE p.RAZAO_SOCIAL = ?
    `, [empresa]);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});









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
