document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');
  
  // Resetar mensagens
  message.className = 'message';
  message.style.display = 'none';
  
  // Validação básica
  if (username === '' || password === '') {
    showMessage('Por favor, preencha todos os campos!', 'error');
    return;
  }
  
  // Simulação de autenticação (usuário: admin, senha: 12345)
  if (username === 'admin' && password === '12345') {
    showMessage('Login realizado com sucesso! Redirecionando...', 'success');
    
    // Simula redirecionamento após 2 segundos
    setTimeout(() => {
      window.location.href = 'https://github.com';
    }, 2000);
  } else {
    showMessage('Usuário ou senha incorretos!', 'error');
  }
});

function showMessage(text, type) {
  const message = document.getElementById('message');
  message.textContent = text;
  message.className = `message ${type}`;
  message.style.display = 'block';
}
