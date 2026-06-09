// 1. Captura os parâmetros da URL (ex: ?edit=3)
    const urlParams = new URLSearchParams(window.location.search);
    const idProdutoEdicao = urlParams.get('edit');

    // Mapeia o botão de envio
    const botaoEnviar = document.querySelector('.btn-enviar');

    // 2. Se houver um ID na URL, significa que estamos EDITANDO um produto existente
    if (idProdutoEdicao) {
        document.querySelector('h1').innerText = "Painel do Admin - Editar Produto";
        if (botaoEnviar) botaoEnviar.innerText = "Salvar Alterações";
        
        // Desativa a obrigatoriedade da imagem ao editar (caso o admin não queira trocar a foto)
        document.getElementById('imagem').removeAttribute('required');

        // Busca os dados atuais do produto no MySQL do Docker para preencher o formulário
        fetch(`/api/produtos/${idProdutoEdicao}`)
            .then(response => response.json())
            .then(produto => {
                document.getElementById('nome').value = produto.nome;
                document.getElementById('preco').value = produto.preco;
                document.getElementById('estoque').value = produto.estoque;
                document.getElementById('descricao').value = produto.descricao;
            })
            .catch(err => console.error("Erro ao buscar produto para edição:", err));
    }

    // 3. UM ÚNICO EVENTO SUBMIT (Gerencia o fluxo dinamicamente)
    document.getElementById('formProduto').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', document.getElementById('nome').value);
        formData.append('preco', document.getElementById('preco').value);
        formData.append('estoque', document.getElementById('estoque').value);
        formData.append('descricao', document.getElementById('descricao').value);
        
        // Só anexa a imagem se o usuário tiver selecionado um arquivo
        if (document.getElementById('imagem').files[0]) {
            formData.append('imagem', document.getElementById('imagem').files[0]);
        }

        // Define dinamicamente se vai disparar para a rota de cadastrar (POST) ou de atualizar (PUT)
        const urlScript = idProdutoEdicao ? `/api/produtos/editar/${idProdutoEdicao}` : '/api/produtos/cadastrar';
        const metodoScript = idProdutoEdicao ? 'PUT' : 'POST';

        fetch(urlScript, {
            method: metodoScript,
            body: formData
        })
        .then(response => {
            if (response.status === 200 || response.status === 201) {
                alert(idProdutoEdicao ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                window.location.href = "produtos.html"; // Mantém no painel de controle
            } else {
                alert('Erro ao salvar o produto.');
            }
        })
        .catch(err => {
            console.error("Erro na requisição:", err);
            alert("Não foi possível conectar ao servidor.");
        });
    }); // <--- Fim do único submit do formulário