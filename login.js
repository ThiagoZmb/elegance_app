// Frontend - Script de Login Corrigido
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const cnpj = document.getElementById('cnpj').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const resDiv = document.getElementById('result');
  
  // Validação básica 
  if (!username || !password || !cnpj) {
    resDiv.textContent = 'Por favor, preencha todos os campos.';
    resDiv.className = 'result error show';
    return;
  }
  
  // Resetar mensagens de erro
  resDiv.textContent = '';
  resDiv.className = 'result';
  
  // Mostrar feedback visual
  showLoading(true);
  resDiv.textContent = 'Verificando credenciais...';
  resDiv.className = 'result show';
  
  const apiUrl = 'https://app-cek0.onrender.com/login';
  
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password, cnpj })
    });
    
    // Verificar se a resposta é válida
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status} - ${res.statusText}`);
    }
    
    const data = await res.json();
   
    if (data.success) {
      // Salvar dados do usuário no localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTime', new Date().toISOString());
        console.log('Dados do usuário salvos:', data.user);
      }
      
      resDiv.textContent = 'Login bem-sucedido!';
      resDiv.className = 'result success show';
      
      // Remover qualquer mensagem de boas-vindas existente
      const existingWelcome = document.getElementById('welcome-message');
      if (existingWelcome) {
        existingWelcome.remove();
      }
      
      // Criar a estrutura da mensagem de boas-vindas
      const welcomeDiv = document.createElement('div');
      welcomeDiv.id = 'welcome-message';
      welcomeDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.5s ease-out;
      `;
      
      const welcomeContent = document.createElement('div');
      welcomeContent.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        transform: scale(0.9);
        animation: scaleIn 0.3s ease-out 0.2s forwards;
      `;
      
      const welcomeHeading = document.createElement('h2');
      const userName = data.user ? data.user.nome : 'Usuário';
      welcomeHeading.textContent = `Bem-vindo, ${userName}!`;
      welcomeHeading.style.cssText = `
        color: #8B0000;
        margin-bottom: 20px;
        font-size: 32px;
        font-weight: bold;
      `;
      
      const welcomeText = document.createElement('p');
      welcomeText.textContent = 'Redirecionando para o painel principal...';
      welcomeText.style.cssText = `
        font-size: 18px;
        color: #333;
        margin-bottom: 30px;
      `;
      
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 5px solid rgba(139, 0, 0, 0.2);
        border-top: 5px solid #8B0000;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 1s linear infinite;
      `;
      
      // Adicionar estilos de animação globalmente
      if (!document.getElementById('login-animations')) {
        const style = document.createElement('style');
        style.id = 'login-animations';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0.8; }
            to { transform: scale(1); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Montar a estrutura
      welcomeContent.appendChild(welcomeHeading);
      welcomeContent.appendChild(welcomeText);
      welcomeContent.appendChild(spinner);
      welcomeDiv.appendChild(welcomeContent);
      document.body.appendChild(welcomeDiv);
      
      // Forçar reflow para garantir a animação
      welcomeDiv.offsetHeight;
      
      // Redirecionar após 2 segundos para melhor UX
      setTimeout(() => {
        window.location.href = "https://thiagozmb.github.io/elegance_app/painel_inicial.html";
      }, 2000);
      
    } else {
      resDiv.textContent = data.message || 'Usuário, senha ou CNPJ inválidos.';
      resDiv.className = 'result error show';
      showLoading(false);
    }
  } catch (err) {
    console.error('Erro no login:', err);
    resDiv.textContent = 'Erro ao conectar ao servidor. Tente novamente.';
    resDiv.className = 'result error show';
    showLoading(false);
  }
});

// Função para mostrar/ocultar loading
function showLoading(show) {
  const loading = document.querySelector('.loading');
  const btnText = document.querySelector('.btn-text');
  const btn = document.querySelector('.login-btn');
  
  if (loading) loading.style.display = show ? 'inline-block' : 'none';
  if (btnText) btnText.textContent = show ? 'Entrando...' : 'Entrar';
  if (btn) btn.disabled = show;
}

// Função para verificar se o usuário já está logado
function checkExistingLogin() {
  console.log('🔍 Verificando login existente...');
  
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userData = localStorage.getItem('user');
  const loginTime = localStorage.getItem('loginTime');
  
  console.log('LocalStorage - isLoggedIn:', isLoggedIn);
  console.log('LocalStorage - userData:', userData ? 'EXISTE' : 'NÃO EXISTE');
  console.log('LocalStorage - loginTime:', loginTime);
  
  if (isLoggedIn === 'true' && userData && loginTime) {
    // Verificar se o login não expirou (24 horas)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    console.log('Diferença em horas desde o login:', hoursDiff.toFixed(2));
    
    if (hoursDiff < 24) {
      console.log('✅ Usuário já logado e sessão válida');
      console.log('Dados do usuário:', JSON.parse(userData));
      
      // Mostrar mensagem de redirecionamento
      const resDiv = document.getElementById('result');
      if (resDiv) {
        resDiv.textContent = 'Você já está logado. Redirecionando...';
        resDiv.className = 'result success show';
      }
      
      setTimeout(() => {
        console.log('🔄 Redirecionando usuário logado...');
        window.location.href = "https://thiagozmb.github.io/elegance_app/painel_inicial.html";
      }, 500);
    } else {
      console.log('⏰ Login expirado, limpando dados...');
      clearUserData();
    }
  } else {
    console.log('❌ Usuário não está logado');
  }
}

// Função para limpar dados do usuário  
function clearUserData() {
  console.log('🧹 Limpando dados do localStorage...');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loginTime');
  console.log('✅ Dados limpos');
}

// Função para logout (para usar em outras páginas)
function logout() {
  console.log('👋 Fazendo logout...');
  clearUserData();
  window.location.href = "index.html";
}

// Função para teste manual no console
window.testLogin = function(cnpj, username, password) {
  console.log('🧪 TESTE MANUAL DE LOGIN');
  console.log('CNPJ:', cnpj);
  console.log('Username:', username);
  console.log('Password:', password ? '***' : 'VAZIO');
  
  const apiUrl = 'https://app-cek0.onrender.com/login';
  const requestData = { username, password, cnpj };
  
  fetch(apiUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
  .then(response => {
    console.log('Status da resposta:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Resultado do teste:', data);
  })
  .catch(error => {
    console.error('Erro no teste:', error);
  });
};

// Verificar login existente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  checkExistingLogin();
  
  // Adicionar evento de Enter nos campos de input
  const inputs = document.querySelectorAll('#cnpj, #username, #password');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
      }
    });
  });
});
