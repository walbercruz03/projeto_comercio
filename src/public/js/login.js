let btnEnviar = document.getElementById("enviar");

        btnEnviar.addEventListener('click', () => {
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
                    // Força o e-mail a ser salvo sempre em letras minúsculas e sem espaços
                    const emailFormatado = usuarioDigitado.trim().toLowerCase();

                    sessionStorage.setItem('idUsuarioLogado', res.body.usuario.id || res.body.usuario.id_usuario);
                    sessionStorage.setItem('emailUsuarioLogado', emailFormatado);
                    sessionStorage.setItem('tipoUsuario', res.body.usuario.tipo_usuario);

                    // DEBUG: Pressione F12 e veja no Console se o tipo_usuario está vindo como 'admin'
                    console.log("Dados do usuário vindos do banco:", res.body.usuario);
                    
                    // VALIDAÇÃO PELO TIPO DE USUÁRIO OU E-MAIL FIXO (Chave Mestra)
                    if (res.body.usuario.tipo_usuario === "admin_principal" || res.body.usuario.tipo_usuario === "admin" || emailFormatado === "admin@gmail.com") {
                        // Se o tipo_usuario falhou no banco, salvamos manualmente no front-end para as outras telas funcionarem
                        if (emailFormatado === "admin@gmail.com" && !res.body.usuario.tipo_usuario) {
                            sessionStorage.setItem('tipoUsuario', 'admin_principal');
                        }
                        alert("Bem-vindo, Administrador! Acessando o painel...");
                        window.location.href = "produtos.html";
                    } else {
                        alert(`Bem-vindo, ${res.body.usuario.nome}! Login realizado com sucesso.`);
                        window.location.href = "apresentacao.html";
                    }
                } else {
                    alert(res.body.erro || "E-mail ou senha incorretos! Tente novamente.");
                }
            })
            .catch(err => {
                console.error("Erro na requisição:", err);
                alert("Não foi possível conectar ao servidor. Verifique se o Docker está rodando.");
            });
        });