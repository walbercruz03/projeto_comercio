document.getElementById("btnRecuperar").addEventListener('click', () => {
    let email = document.getElementById('emailRecuperar').value.trim();
    let cpf = document.getElementById('cpfRecuperar').value.trim();
    let novaSenha = document.getElementById('novaSenha').value.trim();

    if (email == "" || cpf == "" || novaSenha == "") {
        alert("Preencha todos os campos!");
        return; 
    }

    fetch('/api/usuarios/recuperar-senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cpf, novaSenha })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(res => {
        if (res.status === 200) {
            alert("Senha atualizada com sucesso! Faça login com a nova senha.");
            window.location.href = "index.html";
        } else {
            alert(res.body.erro || "Dados incorretos. Verifique email e CPF.");
        }
    })
    .catch(err => {
        console.error("Erro:", err);
        alert("Erro de conexão ao tentar recuperar a senha.");
    });
});