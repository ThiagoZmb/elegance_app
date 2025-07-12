const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middlewares de segurança
app.use(helmet());

// Rate limiting para prevenir ataques de força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: { 
    success: false, 
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares gerais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'db-elegance-v4.mysql.uhserver.com',
  user: process.env.DB_USER || 'tfz',
  password: process.env.DB_PASS || '@04t28b03p',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'db_elegance_v4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig);

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura';

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Validadores de entrada
const loginValidators = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Nome de usuário deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Nome de usuário deve conter apenas letras, números e underscore'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Função para hash da senha (usar ao criar usuários)
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Função para verificar senha
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Rota de login melhorada
app.post('/login', loginLimiter, loginValidators, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { username, password } = req.body;

    // Consultar usuário no banco
    const [rows] = await pool.execute(
      'SELECT id, nome, senha, email, razao_social, ativo FROM cliente_usuarios WHERE nome = ? AND ativo = 1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    const user = rows[0];

    // Verificar senha (assumindo que você já tem senhas hasheadas)
    // Para migração, você pode verificar se a senha está hasheada
    let passwordMatch = false;
    
    if (user.senha.startsWith('$2b$')) {
      // Senha já está hasheada
      passwordMatch = await verifyPassword(password, user.senha);
    } else {
      // Senha ainda não está hasheada (para compatibilidade)
      passwordMatch = password === user.senha;
      
      // Opcional: atualizar para senha hasheada
      if (passwordMatch) {
        const hashedPassword = await hashPassword(password);
        await pool.execute(
          'UPDATE cliente_usuarios SET senha = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.nome,
        email: user.email,
        razaoSocial: user.razao_social
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Atualizar último login
    await pool.execute(
      'UPDATE cliente_usuarios SET ultimo_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.nome,
        email: user.email,
        razaoSocial: user.razao_social
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Rota para verificar token
app.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  });
});

// Rota para dashboard (exemplo de rota protegida)
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Exemplo de dados do dashboard
    const [vendas] = await pool.execute(
      'SELECT COUNT(*) as total_vendas, SUM(valor) as total_valor FROM vendas WHERE MONTH(data_venda) = MONTH(NOW())'
    );
    
    const [clientes] = await pool.execute(
      'SELECT COUNT(*) as total_clientes FROM clientes WHERE MONTH(data_cadastro) = MONTH(NOW())'
    );

    const [tarefas] = await pool.execute(
      'SELECT COUNT(*) as tarefas_pendentes FROM tarefas WHERE status = "pendente"'
    );

    res.json({
      success: true,
      data: {
        vendas: vendas[0]?.total_valor || 0,
        novos_clientes: clientes[0]?.total_clientes || 0,
        tarefas_pendentes: tarefas[0]?.tarefas_pendentes || 0
      }
    });

  } catch (err) {
    console.error('Erro ao buscar dados do dashboard:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao carregar dados do dashboard' 
    });
  }
});

// Rota para logout
app.post('/logout', authenticateToken, (req, res) => {
  // Com JWT, o logout é feito no frontend removendo o token
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// Middleware para tratar erros não capturados
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Algo deu errado!' 
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Rota não encontrada' 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Elegance rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

module.exports = app;
