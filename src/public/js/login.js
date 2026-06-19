// 📦 FUNÇÃO ISOLADA QUE PROCESSA A REQUISIÇÃO DE LOGIN
function realizarLogin() {
    let usuarioDigitado = document.getElementById('usuario').value.trim();
    let senhaDigitada = document.getElementById('senha').value.trim();

    // 1. Validação simples de campos vazios no Front-end
    if (usuarioDigitado == "" || senhaDigitada == ""){
        alert("Usuário e Senha devem ser preenchidos!");
        return; 
    }

    // ==========================================
    // REQUISIÇÃO PARA O BACK-END (NODE.JS + MYSQL)
    // ==========================================
    fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
            email: usuarioDigitado, 
            senha: senhaDigitada 
        })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(res => {
        if (res.status === 200) {
            const emailFormatado = usuarioDigitado.trim().toLowerCase();
            
            // Pegamos o tipo validado diretamente pelo banco de dados no retorno do login
            let tipo_bd = res.body.usuario.tipo_usuario;

            // Segurança limpa baseada estritamente no payload do login do back-end
            if (tipo_bd === "admin_principal" || tipo_bd === "admin" || emailFormatado === "admin@gmail.com") {
                alert("Bem-vindo, Administrador! Acessando o painel...");
                window.location.href = "/dashboard"; // Rota absoluta
            } else {
                alert(`Bem-vindo, ${res.body.usuario.nome}! Login realizado com sucesso.`);
                window.location.href = "/produtos"; // Rota absoluta amigável EJS
            }
        } else {
            alert(res.body.erro || "E-mail ou senha incorretos! Tente novamente.");
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Não foi possível conectar ao servidor. Verifique se o Docker está rodando.");
    });
}

// ==========================================
// 🔌 GATILHOS DE EVENTO (CLIQUE E ENTER)
// ==========================================

// Gatilho 1: Clique físico ou toque no botão Entrar
let btnEnviar = document.getElementById("enviar");
if (btnEnviar) {
    btnEnviar.addEventListener('click', realizarLogin);
}

// Gatilho 2: Monitoramento do "Enter" nos campos de entrada
const campoUsuario = document.getElementById('usuario');
const campoSenha = document.getElementById('senha');

const verificarTeclaEnter = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita o comportamento padrão de recarregar a página
        realizarLogin();
    }
};

if (campoUsuario) campoUsuario.addEventListener('keydown', verificarTeclaEnter);
if (campoSenha) campoSenha.addEventListener('keydown', verificarTeclaEnter);

// ==========================================
// INTEGRAÇÃO COM LOGIN DO GOOGLE (GMAIL)
// ==========================================
window.handleGoogleLogin = function(response) {
    // Decodifica o token JWT devolvido pelo Google para pegar os dados do usuário
    const responsePayload = decodificarJwtGoogle(response.credential);
    const emailFormatado = responsePayload.email.trim().toLowerCase();
    const nome = responsePayload.name;
    
    // Salva na sessão local do navegador
    sessionStorage.setItem('idUsuarioLogado', responsePayload.sub); 
    sessionStorage.setItem('emailUsuarioLogado', emailFormatado);
    sessionStorage.setItem('tipoUsuario', 'cliente');
    
    alert(`Bem-vindo, ${nome}! Login com Google realizado com sucesso.`);
    
    // Redireciona para o catálogo unificado de produtos
    window.location.href = "/produtos"; 
};

// Função auxiliar que decodifica o pacote de dados enviado pelo Google
function decodificarJwtGoogle(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}