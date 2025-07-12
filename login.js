document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const resDiv = document.getElementById('result');
  
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
    
    const data = await res.json();
    
    if (data.success) {
      resDiv.textContent = 'Login bem-sucedido! Redirecionando...';
      resDiv.className = 'result success show';
      
      // Armazenar dados do usuário no localStorage
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        razaoSocial: data.user.razaoSocial
      }));
      
      // Redirecionar após pequeno delay para feedback visual
      setTimeout(() => {
        window.location.href = "https://thiagozmb.github.io/elegance_app/pagina_principal.html";
      }, 1500);
    } else {
      resDiv.textContent = data.error || 'Usuário ou senha inválidos.';
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

// Função para mostrar/ocultar loading
function showLoading(show) {
  const loading = document.querySelector('.loading');
  const btnText = document.querySelector('.btn-text');
  const btn = document.querySelector('.login-btn');
  
  if (show) {
    loading.style.display = 'inline-block';
    btnText.textContent = 'Entrando...';
    btn.disabled = true;
  } else {
    loading.style.display = 'none';
    btnText.textContent = 'Entrar';
    btn.disabled = false;
  }
}

// Verificar se o usuário já está logado ao carregar a página
window.addEventListener('load', function() {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (token && userData) {
    // Verificar se o token ainda é válido
    verifyToken(token);
  }
});

// Função para verificar se o token ainda é válido
async function verifyToken(token) {
  try {
    const response = await fetch('https://app-cek0.onrender.com/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Token válido, redirecionar para a página principal
      window.location.href = "https://thiagozmb.github.io/elegance_app/pagina_principal.html";
    } else {
      // Token inválido, limpar localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    // Em caso de erro, limpar localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  }
}
