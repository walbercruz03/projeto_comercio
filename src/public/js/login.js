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
            .then(async res => {
                if (res.status === 200) {
                    // Força o e-mail a ser salvo sempre em letras minúsculas e sem espaços
                    const emailFormatado = usuarioDigitado.trim().toLowerCase();
                    let tipo_bd = res.body.usuario.tipo_usuario;

                    // Fallback: Se o backend falhou em retornar o 'tipo_usuario' no login, confirmamos na rota de admins
                    if (tipo_bd !== "admin_principal" && tipo_bd !== "admin" && emailFormatado !== "admin@gmail.com") {
                        try {
                            const reqAdmins = await fetch('/api/usuarios/admins');
                            if (reqAdmins.ok) {
                                const lista = await reqAdmins.json();
                                if (lista.some(a => a.email.toLowerCase() === emailFormatado)) tipo_bd = "admin";
                            }
                        } catch (e) { console.error(e); }
                    }

                    sessionStorage.setItem('idUsuarioLogado', res.body.usuario.id || res.body.usuario.id_usuario);
                    sessionStorage.setItem('emailUsuarioLogado', emailFormatado);
                    sessionStorage.setItem('tipoUsuario', tipo_bd || 'cliente');

                    // DEBUG: Pressione F12 e veja no Console se o tipo_usuario está vindo como 'admin'
                    console.log("Dados do usuário vindos do banco:", res.body.usuario);
                    
                    // VALIDAÇÃO PELO TIPO DE USUÁRIO OU E-MAIL FIXO (Chave Mestra)
                    if (tipo_bd === "admin_principal" || tipo_bd === "admin" || emailFormatado === "admin@gmail.com") {
                        // Se o tipo_usuario falhou no banco, salvamos manualmente no front-end para as outras telas funcionarem
                        if (emailFormatado === "admin@gmail.com" && tipo_bd !== "admin_principal") {
                            sessionStorage.setItem('tipoUsuario', 'admin_principal');
                        }
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

        // ==========================================
        // INTEGRAÇÃO COM LOGIN DO GOOGLE (GMAIL)
        // ==========================================
        window.handleGoogleLogin = function(response) {
            // Decodifica o token JWT devolvido pelo Google para pegar os dados do usuário
            const responsePayload = decodificarJwtGoogle(response.credential);
            
            const emailFormatado = responsePayload.email.trim().toLowerCase();
            const nome = responsePayload.name;
            
            // Salva na sessão e redireciona (Autentica direto para a vitrine sem passar pelo cadastro manual)
            sessionStorage.setItem('idUsuarioLogado', responsePayload.sub); // ID numérico do Google
            sessionStorage.setItem('emailUsuarioLogado', emailFormatado);
            sessionStorage.setItem('tipoUsuario', 'cliente');
            
            alert(`Bem-vindo, ${nome}! Login com Google realizado com sucesso.`);
            window.location.href = "apresentacao.html";
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