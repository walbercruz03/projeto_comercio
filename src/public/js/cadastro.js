 let btnCadastrar = document.getElementById("cadastrar");

    btnCadastrar.addEventListener('click', () => {
        let nome = document.getElementById('nome').value.trim();
        let cpf = document.getElementById('cpf').value.trim();
        let dataNasc = document.getElementById('dataNascimento').value.trim();
        let email = document.getElementById('email').value.trim();
        let telefone = document.getElementById('telefone').value.trim();
        let senha = document.getElementById('senha').value.trim();

        // 1. Mantém a validação de campos vazios no front-end
        if (nome == "" || cpf == "" || dataNasc == "" || email == "" || telefone == "" || senha == "") {
            alert("Todos os campos devem ser preenchidos!");
            return; 
        }

        // ==========================================
        // ENVIANDO OS DADOS PARA O BACK-END (MYSQL)
        // ==========================================

        // Faz o disparo para a rota de cadastro que criamos no Node.js
        fetch('/api/usuarios/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                cpf: cpf,
                dataNascimento: dataNasc, // Note que mandamos com o nome esperado pelo Controller
                email: email,
                telefone: telefone,
                senha: senha
            })
        })
        // Processa a resposta JSON vinda do servidor
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(res => {
            // Se o status for 201 (Created), o usuário foi inserido no banco com sucesso!
            if (res.status === 201) {
                alert("Cadastro realizado com sucesso no banco de dados!");
                window.location.href = "/login"; // ⚡ CORREÇÃO: Redireciona para a rota de login correta.
                
                // Limpa os campos do formulário
                document.getElementById("formCadastro").reset();
            } else {
                // Caso o e-mail já exista (status 400) ou dê outro erro, exibe a mensagem tratada no back-end
                alert(res.body.erro || "Erro ao realizar o cadastro.");
            }
        })
        .catch(err => {
            console.error("Erro na requisição:", err);
            alert("Não foi possível conectar ao servidor. Verifique se o contêiner do Docker está ativo.");
        });
        
    });