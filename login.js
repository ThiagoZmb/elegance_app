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
      
      // Redirecionar após pequeno delay para feedback visual
      setTimeout(() => {
        // CORREÇÃO: URL absoluta para garantir funcionamento
        window.location.href = "https://thiagozmb.github.io/app/pagina_principal.html";
      }, 1500);
    } else {
      resDiv.textContent = 'Usuário ou senha inválidos.';
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
