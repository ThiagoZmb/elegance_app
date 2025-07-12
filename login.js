document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const resDiv = document.getElementById('result');
  
  resDiv.textContent = '';
  resDiv.className = 'result';
  showLoading(true);
  
  try {
    const res = await fetch('https://app-cek0.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Armazena o nome da empresa no localStorage
      localStorage.setItem('empresa', data.empresa);
      
      resDiv.textContent = 'Login bem-sucedido! Redirecionando...';
      resDiv.className = 'result success show';
      
      setTimeout(() => {
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
