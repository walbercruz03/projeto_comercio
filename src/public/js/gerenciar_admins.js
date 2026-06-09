const tipoUsuario = sessionStorage.getItem('tipoUsuario');
const emailUsuario = sessionStorage.getItem('emailUsuarioLogado');

// 1. Validação de Segurança (Incluindo a chave mestra)
if (tipoUsuario !== 'admin_principal' && emailUsuario !== 'admin@gmail.com') {
    alert("Acesso negado. Apenas o administrador principal pode acessar esta página.");
    window.location.href = "apresentacao.html";
}

window.addEventListener('DOMContentLoaded', carregarAdmins);

// 2. Acompanhamento: Carrega e exibe a lista visual de Administradores
function carregarAdmins() {
    fetch('/api/usuarios/admins')
        .then(res => {
            if(!res.ok) throw new Error("Erro de conexão");
            return res.json();
        })
        .then(admins => {
            const container = document.getElementById('listaAdmins');
            if (!container) return;
            
            container.innerHTML = '';
            let adminsSecundarios = 0;

            admins.forEach(admin => {
                // Só exibe os sub-administradores (esconde a si mesmo/admin principal)
                if (admin.tipo_usuario !== 'admin_principal' && admin.email !== 'admin@gmail.com') {
                    adminsSecundarios++;
                    const id = admin.id_usuario || admin.id;
                    container.innerHTML += `
                        <div class="card-admin" style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: #333;"><i class="fa-solid fa-user-shield" style="color: #0d6efd;"></i> ${admin.nome}</h4>
                                <p style="margin: 0; color: #666; font-size: 14px;"><i class="fa-solid fa-envelope"></i> ${admin.email}</p>
                            </div>
                            <div>
                                <button onclick="editarAdmin(${id}, '${admin.nome}', '${admin.email}')" style="background: #ffc107; color: #000; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;"><i class="fa-solid fa-pen"></i> Editar</button>
                                <button onclick="excluirAdmin(${id})" style="background: #dc3545; color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;"><i class="fa-solid fa-trash"></i> Excluir</button>
                            </div>
                        </div>
                    `;
                }
            });

            // Se não houver nenhum sub-admin cadastrado
            if (adminsSecundarios === 0) {
                container.innerHTML = '<p style="color: #666; font-style: italic; background: #f9f9f9; padding: 15px; border-radius: 8px;">Nenhum administrador adicional cadastrado no momento. Utilize o formulário para adicionar novos gestores.</p>';
            }
        })
        .catch(err => {
            const container = document.getElementById('listaAdmins');
            if(container) container.innerHTML = '<p style="color: red;">Erro ao carregar os administradores do banco de dados.</p>';
        });
}

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
            carregarAdmins();
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
                carregarAdmins();
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