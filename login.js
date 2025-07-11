document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const resDiv = document.getElementById('result');

  // Troque pela URL do seu backend no Render!
  const apiUrl = 'https://SEU-RENDER-API.onrender.com/login';

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      resDiv.textContent = 'Login realizado com sucesso!';
    } else {
      resDiv.textContent = 'Usuário ou senha inválidos.';
    }
  } catch (err) {
    resDiv.textContent = 'Erro ao conectar ao servidor.';
  }
});
