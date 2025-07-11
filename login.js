document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const resDiv = document.getElementById('result');

  const apiUrl = 'https://app-cek0.onrender.com/login';

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      // Redireciona para a página de bem-vindo
      //window.location.href = "pagina_principal.html";
      window.location.href="https://thiagozmb.github.io/app/pagina_principal.html"
    } else {
      resDiv.textContent = 'Usuário ou senha inválidos.';
    }
  } catch (err) {
    resDiv.textContent = 'Erro ao conectar ao servidor.';
  }
});
