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
                    
                    // VALIDAÇÃO PELO TIPO DE USUÁRIO
                    if (res.body.usuario.tipo_usuario === "admin_principal" || res.body.usuario.tipo_usuario === "admin") {
                        alert("Bem-vindo, Administrador! Acessando o painel...");
                        window.location.href = "apresentacao.html";
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