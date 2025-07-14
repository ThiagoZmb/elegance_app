document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const resDiv = document.getElementById('result');
  
  // Validação básica
  if (!username || !password) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    // Verificar se a resposta é válida
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Resposta da API:', data); // Log para depuração
    
    if (data.success) {
      resDiv.textContent = 'Login bem-sucedido!';
      resDiv.className = 'result success show';
      
      // Armazena a razão social no sessionStorage
      sessionStorage.setItem('razao_social', data.razao_social);
      
      // Criar e exibir a mensagem de boas-vindas
      const welcomeDiv = document.createElement('div');
      welcomeDiv.id = 'welcome-message';
      welcomeDiv.innerHTML = `
        <div class="welcome-content">
          <h2>Bem-vindo, ${data.razao_social}!</h2>
          <p>Redirecionando para o painel principal...</p>
          <div class="loading-spinner"></div>
        </div>
      `;
      document.body.appendChild(welcomeDiv);
      
      // Adicionar estilos para a mensagem de boas-vindas
      const style = document.createElement('style');
      style.textContent = `
        #welcome-message {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }
        .welcome-content {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.5s ease-out;
        }
        .welcome-content h2 {
          color: #8B0000;
          margin-bottom: 20px;
          font-size: 32px;
        }
        .welcome-content p {
          font-size: 18px;
          color: #333;
          margin-bottom: 30px;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(139, 0, 0, 0.2);
          border-top: 5px solid #8B0000;
          border-radius: 50%;
          margin: 0 auto;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = "https://thiagozmb.github.io/elegance_app/pagina_principal.html";
      }, 3000);
      
    } else {
      resDiv.textContent = data.message || 'Usuário ou senha inválidos.';
      resDiv.className = 'result error show';
      showLoading(false);
    }
  } catch (err) {
    resDiv.textContent = 'Erro ao conectar ao servidor. Tente novamente.';
    resDiv.className = 'result error show';
    showLoading(false);
    console.error('Erro no login:', err);
  }
});

// Função para mostrar/ocultar loading com verificação de elementos
function showLoading(show) {
  const loading = document.querySelector('.loading');
  const btnText = document.querySelector('.btn-text');
  const btn = document.querySelector('.login-btn');
  
  // Verificar se os elementos existem antes de manipulá-los
  if (loading) {
    loading.style.display = show ? 'inline-block' : 'none';
  }
  
  if (btnText) {
    btnText.textContent = show ? 'Entrando...' : 'Entrar';
  }
  
  if (btn) {
    btn.disabled = show;
  }
}
