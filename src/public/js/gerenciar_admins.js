const tipoUsuario = sessionStorage.getItem('tipoUsuario');
if (tipoUsuario !== 'admin_principal') {
    alert("Acesso negado. Apenas o administrador principal pode acessar esta página.");
    window.location.href = "apresentacao.html";
}

window.addEventListener('DOMContentLoaded', carregarAdmins);

function carregarAdmins() {
    fetch('/api/usuarios/admins')
        .then(res => res.json())
        .then(admins => {
            const container = document.getElementById('listaAdmins');
            if (!container) return;
            container.innerHTML = '';
            admins.forEach(admin => {
                if (admin.tipo_usuario !== 'admin_principal') {
                    const id = admin.id_usuario || admin.id;
                    container.innerHTML += `
                        <div class="card-admin" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                            <p><strong>Nome:</strong> ${admin.nome}</p>
                            <p><strong>Email:</strong> ${admin.email}</p>
                            <button onclick="editarAdmin(${id}, '${admin.nome}', '${admin.email}')">Editar</button>
                            <button onclick="excluirAdmin(${id})">Excluir</button>
                        </div>
                    `;
                }
            });
        });
}

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
    .then(res => {
        if(res.ok) {
            alert("Administrador salvo com sucesso!");
            carregarAdmins();
            document.getElementById('formAdmin').reset();
            document.getElementById('adminId').value = '';
        } else {
            alert("Erro ao salvar administrador.");
        }
    });
});

function excluirAdmin(id) {
    if(confirm("Tem certeza que deseja excluir este administrador?")) {
        fetch(`/api/usuarios/admins/${id}`, { method: 'DELETE' })
        .then(res => {
            if(res.ok) {
                alert("Administrador removido!");
                carregarAdmins();
            }
        });
    }
}

function editarAdmin(id, nome, email) {
    document.getElementById('adminId').value = id;
    document.getElementById('nomeAdmin').value = nome;
    document.getElementById('emailAdmin').value = email;
}