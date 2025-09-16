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






app.post('/login', async (req, res) => {
  const { username, password, cnpj } = req.body;
  
  if (!username || !password || !cnpj) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos os campos são obrigatórios' 
    });
  }
  
  // Formatar o CNPJ para apenas números
  const cnpjNumeros = cnpj.replace(/\D/g, '');
  
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    
    // Query com INNER JOIN e remoção de caracteres não numéricos do CNPJ no banco
    const [rows] = await conn.execute(`
      SELECT 
        cu.NOME,
        cu.RAZAO_SOCIAL,
        cc.CNPJ_CPF
      FROM cliente_usuarios cu
      INNER JOIN cadastro_clientes cc ON cu.RAZAO_SOCIAL = cc.RAZAO_SOCIAL
      WHERE cu.NOME = ? AND cu.SENHA = ? AND REPLACE(REPLACE(REPLACE(cc.CNPJ_CPF, '.', ''), '/', ''), '-', '') = ?
    `, [username, password, cnpjNumeros]);

    if (rows.length > 0) {
      const user = rows[0];
      const userCnpj = user.CNPJ_CPF;
      
      
      // Login bem-sucedido
      res.json({ 
        success: true, 
        message: 'Login realizado com sucesso',
        user: {
          nome: user.NOME,
          empresa: user.RAZAO_SOCIAL,
          cnpj: user.CNPJ_CPF.replace(/\D/g, ''), // Retornar apenas números
          cnpj_comp: user.CNPJ_CPF
        }
      });

      //localStorage.setItem('userCnpj', userCnpj);
      console.log(`Login bem-sucedido: ${user.NOME} - CNPJ: ${user.CNPJ_CPF.replace(/\D/g, '')} - ${new Date().toISOString()}`);
      
    } else {
      res.json({ 
        success: false, 
        message: 'Usuário, senha ou CNPJ inválidos' 
      });
      
      console.log(`Tentativa de login falhada: ${username} - CNPJ: ${cnpjNumeros} - ${new Date().toISOString()}`);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  } finally {
    if (conn) {
      conn.end().catch(err => console.error('Erro ao fechar conexão:', err));
    }
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










    

// Endpoint para buscar dados dos pedidos do RJ
app.get('/dados_pedidos_rj', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Query para buscar os pedidos apenas de clientes do RJ
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
FROM
    ped_orc p
INNER JOIN
    cadastro_clientes c ON p.RAZAO_SOCIAL = c.RAZAO_SOCIAL
WHERE
    c.ESTADO = 'RJ' AND p.TIPO='Pedido'
ORDER BY
    p.DATA DESC;
    `);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});




//WHERE REPLACE(REPLACE(REPLACE(cc.CNPJ_CPF, '.', ''), '/', ''), '-', '') = ?
app.get('/pedidos_cnpj', async (req, res) => {
  try {
   
    //const user_cnpj =  '08.951.388/0001-18';
     const user_cnpj = req.query.cnpj_comp;
      console.log(user_cnpj);
    
    const conn = await mysql.createConnection(dbConfig);
    

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
      INNER JOIN cadastro_clientes cc ON p.RAZAO_SOCIAL = cc.RAZAO_SOCIAL
      WHERE cc.CNPJ_CPF = ? AND p.TIPO='Pedido'
    `, [user_cnpj]); 

    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});







// Endpoint para buscar dados dos pedidos
app.get('/detalhe_pedidos', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Query para buscar os pedidos
   const [rows] = await conn.execute(`
      
      SELECT * FROM ped_orc_lista_itens WHERE ped_orc_lista_itens.NUMERO='" & Numero_Pedido & "'  AND  ped_orc_lista_itens.TIPO='Pedido' 
      
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





app.get('/itens_pedido', async (req, res) => {
  try {
    const { numero } = req.query;
    if (!numero) {
      return res.status(400).json({ error: 'Número do pedido é obrigatório' });
    }

    const conn = await mysql.createConnection(dbConfig);
    
    // Query para buscar os itens do pedido
    // Note: This is a hypothetical query. Adjust according to your database schema.
    const [rows] = await conn.execute(`
      SELECT 
        item,
        qtd,
        tipo_produto,
        perfil,
        acabamento_perfil,
        cor_perfil,
        puxador,
        qtd_puxador,
        acabamento_puxador,
        posicao_puxador,
        tam_puxador,
        qtd_furos,
        pos_furos,
        revestimento,
        acabamento_revestimento,
        cor_revestimento,
        altura,
        largura,
        kit_sistema_correr,
        qtd_sistema_correr,
        amortecedor,
        qtd_amortecedor,
        trilho_sup,
        qtd_trilho_sup,
        tam_trilho_sup,
        trilho_inf,
        qtd_trilho_inf,
        tam_trilho_inf,
        acessorios,
        produto,
        modelo_material,
        acabamento,
        cor,
        profundidade,
        observacao,
        unitario,
        total
      FROM ped_orc_itens_v4
      WHERE NUMERO = ?
    `, [numero]);
    
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar itens do pedido:', err);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});
