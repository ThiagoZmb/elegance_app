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


















// BACKEND - Endpoint de Login Simplificado com Debug
app.post('/login', async (req, res) => {
  console.log('=== INÍCIO DO LOGIN ===');
  console.log('Dados recebidos:', req.body);
  
  const { username, password, cnpj } = req.body;
  
  // Log dos valores extraídos
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('CNPJ:', cnpj);
  
  // Validação dos dados recebidos
  if (!username || !password || !cnpj) {
    console.log('Erro: Campos obrigatórios não preenchidos');
    return res.status(400).json({ 
      success: false, 
      message: 'Todos os campos são obrigatórios' 
    });
  }
  
  let conn;
  try {
    console.log('Conectando ao banco de dados...');
    conn = await mysql.createConnection(dbConfig);
    console.log('Conexão estabelecida com sucesso');
    
    // Query simplificada
    const query = `
      SELECT 
        cu.NOME,
        cu.RAZAO_SOCIAL,
        cc.CNPJ
      FROM cliente_usuarios cu
      INNER JOIN cadastro_clientes cc ON cu.RAZAO_SOCIAL = cc.RAZAO_SOCIAL
      WHERE cu.NOME = ? AND cu.SENHA = ? AND cc.CNPJ = ?
    `;
    
    console.log('Executando query:', query);
    console.log('Parâmetros:', [username, password, cnpj]);
    
    const [rows] = await conn.execute(query, [username, password, cnpj]);
    
    console.log('Resultado da query:', rows);
    console.log('Número de registros encontrados:', rows.length);
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('Usuário encontrado:', user);
      
      // Login bem-sucedido
      const response = { 
        success: true, 
        message: 'Login realizado com sucesso',
        user: {
          nome: user.NOME,
          empresa: user.RAZAO_SOCIAL,
          cnpj: user.CNPJ
        }
      };
      
      console.log('Resposta de sucesso:', response);
      res.json(response);
      
    } else {
      console.log('Nenhum usuário encontrado com essas credenciais');
      
      // Vamos fazer queries separadas para debug
      console.log('=== DEBUG: Verificando dados separadamente ===');
      
      // Verificar se o usuário existe
      const [userCheck] = await conn.execute(
        'SELECT NOME, RAZAO_SOCIAL FROM cliente_usuarios WHERE NOME = ?', 
        [username]
      );
      console.log('Usuários com esse nome:', userCheck);
      
      // Verificar se a senha está correta
      const [passCheck] = await conn.execute(
        'SELECT NOME FROM cliente_usuarios WHERE NOME = ? AND SENHA = ?', 
        [username, password]
      );
      console.log('Usuários com nome e senha corretos:', passCheck);
      
      // Verificar se o CNPJ existe
      const [cnpjCheck] = await conn.execute(
        'SELECT CNPJ, RAZAO_SOCIAL FROM cadastro_clientes WHERE CNPJ = ?', 
        [cnpj]
      );
      console.log('Clientes com esse CNPJ:', cnpjCheck);
      
      res.json({ 
        success: false, 
        message: 'Usuário, senha ou CNPJ inválidos' 
      });
    }
    
  } catch (err) {
    console.error('=== ERRO NO LOGIN ===');
    console.error('Erro completo:', err);
    console.error('Stack trace:', err.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: err.message
    });
  } finally {
    if (conn) {
      console.log('Fechando conexão com o banco');
      await conn.end();
    }
  }
  
  console.log('=== FIM DO LOGIN ===');
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
      WHERE p.TIPO='Pedido'
      ORDER BY p.DATA DESC
      
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});




// Endpoint para buscar dados dos pedidos
app.get('/dados_pedidos_rj', async (req, res) => {
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
      INNER JOIN cadastro_clientes c ON p.RAZAO_SOCIAL = c.RAZAO_SOCIAL
      WHERE c.ESTADO = 'RJ' AND p.TIPO='Pedido'
      ORDER BY p.DATA DESC
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
