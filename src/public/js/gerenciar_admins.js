// A validação de segurança e o carregamento dos admins agora são feitos
// de forma robusta no backend (SSR com EJS e JWT), garantindo proteção total.

// 3. Cadastro / Edição de Admins
document.getElementById('formAdmin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('adminId').value;
    const nome = document.getElementById('nomeAdmin').value;
    const email = document.getElementById('emailAdmin').value;
    const senha = document.getElementById('senhaAdmin').value;

    const url = id ? `/api/usuarios/admins/${id}` : '/api/usuarios/admins';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo_usuario: 'admin' })
    })
    .then(async res => {
        if(res.ok) {
            alert(id ? "Dados do administrador atualizados com sucesso!" : "Novo administrador cadastrado com sucesso!");
            window.location.reload(); // Deixa o servidor remontar a página com o novo dado
            document.getElementById('formAdmin').reset();
            document.getElementById('adminId').value = '';
            
            // Restaura o botão e senha obrigatória após editar/salvar
            const btnSubmit = document.querySelector('#formAdmin button[type="submit"]');
            if(btnSubmit) btnSubmit.innerText = "Cadastrar Administrador";
            document.getElementById('senhaAdmin').setAttribute('required', 'true');
            document.getElementById('senhaAdmin').placeholder = "Senha do Admin";
        } else {
            const errData = await res.json().catch(() => ({}));
            alert(errData.erro || "Erro ao salvar administrador. Verifique os dados.");
        }
    });
});

// 4. Ações
function excluirAdmin(id) {
    if(confirm("Tem certeza que deseja excluir este administrador?")) {
        fetch(`/api/usuarios/admins/${id}`, { method: 'DELETE' })
        .then(res => {
            if(res.ok) {
                alert("Administrador removido com sucesso!");
                window.location.reload(); // Recarrega para refletir a remoção via SSR
            } else {
                alert("Falha ao remover o administrador.");
            }
        });
    }
}

function editarAdmin(id, nome, email) {
    document.getElementById('adminId').value = id;
    document.getElementById('nomeAdmin').value = nome;
    document.getElementById('emailAdmin').value = email;

    // Na edição, a senha não é obrigatória
    document.getElementById('senhaAdmin').removeAttribute('required');
    document.getElementById('senhaAdmin').placeholder = "Deixe em branco para manter a senha";

    // Altera o texto do botão
    const btnSubmit = document.querySelector('#formAdmin button[type="submit"]');
    if(btnSubmit) btnSubmit.innerText = "Salvar Alterações";

    // Rola a tela suavemente para o formulário
    document.getElementById('formAdmin').scrollIntoView({ behavior: 'smooth' });
}