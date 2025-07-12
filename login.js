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
    
    if (data.success) {
      resDiv.textContent = 'Login bem-sucedido! Redirecionando...';
      resDiv.className = 'result success show';


      // Armazena a razão social no sessionStorage
      sessionStorage.setItem('razao_social', data.razao_social);

      // Redirecionar após pequeno delay para feedback visual
      setTimeout(() => {
        window.location.href = ".pagina_principal.html";
      }, 1500);
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
