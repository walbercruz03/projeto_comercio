// =========================================================================
// ⚡ 🆕 CONTROLE DE NAVEGAÇÃO POR ABAS (Correção de Escopo)
// =========================================================================

function alternarAba(idAbaAlvo, botaoClicado) {
    // 1. Remove a classe active de todas as seções de conteúdo e botões de abas
    document.querySelectorAll('.tab-conteudo').forEach(aba => aba.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // 2. Ativa a seção de conteúdo correspondente ao ID passado por parâmetro
    const abaAlvo = document.getElementById(idAbaAlvo);
    if (abaAlvo) {
        abaAlvo.classList.add('active');
    }
    
    // 3. Ativa visualmente o botão correto usando a referência direta do parâmetro
    if (botaoClicado) {
        botaoClicado.classList.add('active');
    }
}

// =========================================================================
// 📦 SCRIPT DO PRODUTO (Mantendo sua lógica original intacta)
// =========================================================================

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

    // Busca os dados atuais do produto no Postgres do Docker para preencher o formulário
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

// 3. UM ÚNICO EVENTO SUBMIT (Gerencia o fluxo de PRODUTOS dinamicamente)
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
            window.location.href = "/produtos"; // Mantém no painel dinâmico (EJS)
        } else {
            alert('Erro ao salvar o produto.');
        }
    })
    .catch(err => {
        console.error("Erro na requisição:", err);
        alert("Não foi possível conectar ao servidor.");
    });
});


// =========================================================================
// 🎨 SCRIPT DE CUSTOMIZAÇÃO VISUAL (Fase 2 - OpenSpec)
// =========================================================================

const formCustomizar = document.getElementById('formCustomizarLoja');

if (formCustomizar) {
    formCustomizar.addEventListener('submit', function(e) {
        e.preventDefault();

        // Criamos um FormData porque precisamos enviar um arquivo físico (Logo) via multipart/form-data
        const customData = new FormData();
        
        customData.append('pagina', document.getElementById('selectPagina').value);
        customData.append('cor_fundo', document.getElementById('corFundo').value);
        customData.append('cor_primaria', document.getElementById('corPrimaria').value);
        
        // Verifica se o Administrador anexou um arquivo de logo
        const arquivoLogo = document.getElementById('logoEmpresa').files[0];
        if (arquivoLogo) {
            customData.append('logo', arquivoLogo);
        }

        // Dispara a requisição POST para a API unificada em usuarioRoutes
        fetch('/api/usuarios/layout/config', {
            method: 'POST',
            body: customData
            // ⚠️ Importante: O cabeçalho 'Content-Type' NÃO deve ser definido manualmente aqui.
            // O próprio navegador cuida de gerar o boundary correto quando enviamos um FormData.
        })
        .then(response => {
            if (response.status === 403) {
                alert("Sua sessão expirou ou você não tem permissão de administrador.");
                window.location.href = "/login";
                return null;
            }
            if (response.ok) {
                return response.json();
            }
            throw new Error("Erro ao atualizar as preferências visuais.");
        })
        .then(dados => {
            if (!dados) return;
            alert(dados.mensagem || "Identidade visual updated com sucesso!");
            
            // Recarrega a página atual para aplicar a nova cor de fundo do dashboard na hora
            window.location.reload();
        })
        .catch(err => {
            console.error("❌ Erro ao customizar:", err);
            alert("Não foi possível salvar o visual do sistema.");
        });
    });
}