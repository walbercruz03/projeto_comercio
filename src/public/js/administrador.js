// Cache local dos produtos carregados do banco e itens da venda atual
let listaProdutosDoBanco = [];
let carrinhoVendaPresencial = [];

// =========================================================================
// ⚡ CONTROLE DE NAVEGAÇÃO POR ABAS (MENU LATERAL)
// =========================================================================
function alternarAba(idAbaAlvo, botaoClicado) {
    // 1. Remove a classe active de todas as seções de conteúdo e botões do menu lateral
    document.querySelectorAll('.tab-conteudo').forEach(aba => aba.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));

    // 2. Ativa a seção de conteúdo correspondente ao ID passado por parâmetro
    const abaAlvo = document.getElementById(idAbaAlvo);
    if (abaAlvo) {
        abaAlvo.classList.add('active');
    }
    
    // 3. Ativa visualmente o botão correto na barra lateral
    if (botaoClicado) {
        botaoClicado.classList.add('active');
    }
}

// =========================================================================
// 🛒 LOGICA DE PRODUTOS E CARRINHO DE VENDA PRESENCIAL
// =========================================================================
function carregarProdutosNoSelect() {
    const selectProduto = document.getElementById('vendaProduto');
    if (!selectProduto) return;

    fetch('/api/produtos') 
        .then(response => response.json())
        .then(produtos => {
            selectProduto.innerHTML = '<option value="">Selecione um produto cadastrado...</option>';
            listaProdutosDoBanco = Array.isArray(produtos) ? produtos : (produtos.produtos || []);

            if (listaProdutosDoBanco.length === 0) {
                selectProduto.innerHTML = '<option value="">Nenhum produto encontrado no estoque</option>';
                return;
            }

            listaProdutosDoBanco.forEach(prod => {
                const item = prod.dataValues ? prod.dataValues : prod;
                const option = document.createElement('option');
                
                // Usa a chave id_produto mapeada no orm.js
                option.value = item.id_produto || item.id; 
                option.text = `${item.nome} - R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')} (Estoque: ${item.estoque})`;
                selectProduto.appendChild(option);
            });
        })
        .catch(err => {
            console.error("❌ Erro ao popular o select de produtos:", err);
            selectProduto.innerHTML = '<option value="">Erro ao carregar os produtos</option>';
        });
}

function adicionarItemAoCarrinho() {
    const selectProduto = document.getElementById('vendaProduto');
    const inputQtd = document.getElementById('vendaQuantidade');
    
    const idSelecionado = parseInt(selectProduto.value, 10);
    const quantidade = parseInt(inputQtd.value, 10);

    if (!idSelecionado || isNaN(idSelecionado)) {
        alert("Por favor, selecione um produto válido da lista.");
        return;
    }
    if (quantidade <= 0 || isNaN(quantidade)) {
        alert("Insira uma quantidade maior que zero.");
        return;
    }

    // Busca o produto na lista cacheada do banco
    const produtoDb = listaProdutosDoBanco.find(p => {
        const item = p.dataValues ? p.dataValues : p;
        return (item.id_produto || item.id) === idSelecionado;
    });

    const dadosLimpos = produtoDb && produtoDb.dataValues ? produtoDb.dataValues : produtoDb;

    if (!dadosLimpos) return;

    if (quantidade > dadosLimpos.estoque) {
        alert(`Estoque insuficiente! Quantidade disponível: ${dadosLimpos.estoque}`);
        return;
    }

    // Valida se o produto já está na lista da venda para apenas somar a quantidade
    const itemExistente = carrinhoVendaPresencial.find(item => item.id_produto === idSelecionado);
    if (itemExistente) {
        if ((itemExistente.quantidade + quantidade) > dadosLimpos.estoque) {
            alert(`A soma dos itens ultrapassa o estoque disponível (${dadosLimpos.estoque}).`);
            return;
        }
        itemExistente.quantidade += quantidade;
    } else {
        carrinhoVendaPresencial.push({
            id_produto: idSelecionado,
            nome: dadosLimpos.nome,
            preco: parseFloat(dadosLimpos.preco),
            quantidade: quantidade
        });
    }

    // Reseta os campos do seletor e atualiza a interface
    inputQtd.value = 1;
    selectProduto.value = "";
    renderizarTabelaCarrinho();
}

function removerItemCarrinho(index) {
    carrinhoVendaPresencial.splice(index, 1);
    renderizarTabelaCarrinho();
}

function renderizarTabelaCarrinho() {
    const tbody = document.querySelector('#tabelaItensVenda tbody');
    const txtTotal = document.getElementById('txtTotalVenda');
    if (!tbody) return;

    if (carrinhoVendaPresencial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #999;">Nenhum produto adicionado ainda.</td></tr>`;
        if (txtTotal) txtTotal.innerText = "Total Geral: R$ 0,00";
        return;
    }

    tbody.innerHTML = "";
    let totalGeral = 0;

    carrinhoVendaPresencial.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.nome}</strong></td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
            <td>
                <button type="button" style="color: #dc3545; background: none; border: none; cursor: pointer; padding: 5px;" onclick="removerItemCarrinho(${index})">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (txtTotal) {
        txtTotal.innerText = `Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    }
}

// =========================================================================
// ⚡ VERSÃO CORRIGIDA E ADAPTADA AO PEDIDOCONTROLLER
// =========================================================================
function finalizarVendaPresencial() {
    if (carrinhoVendaPresencial.length === 0) {
        alert("Adicione pelo menos um produto antes de fechar a venda.");
        return;
    }

    // Criamos o payload exatamente como o controller e o model esperam receber
    const payload = {
        itens: carrinhoVendaPresencial.map(item => ({
            id_produto: parseInt(item.id_produto, 10),
            produtoId: parseInt(item.id_produto, 10), // Redundância para compatibilidade
            quantidade: parseInt(item.quantidade, 10)
        }))
    };

    console.log("Enviando itens da venda presencial:", payload);

    fetch('/api/pedidos/finalizar', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include', // Essencial para enviar os cookies da sessão atual do admin
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.ok) {
            alert("Venda presencial registrada e pedido criado com sucesso!");
            carrinhoVendaPresencial = [];
            window.location.reload();
        } else {
            // Se o servidor retornar erro, vamos verificar se é autenticação (401) ou outra falha
            console.error("Erro no servidor. Status:", res.status);
            if (res.status === 401) {
                alert("Erro de autenticação: Certifique-se de que o token do usuário possui a propriedade 'id' definida no payload do JWT.");
            } else {
                alert("Erro ao registrar venda. Certifique-se de que há estoque suficiente para os itens selecionados.");
            }
        }
    })
    .catch(err => {
        console.error("Erro na comunicação com o servidor:", err);
        alert("Erro ao conectar com o servidor.");
    });
}
// =========================================================================
// 📦 SCRIPT DO PRODUTO (Cadastro / Edição Seguro)
// =========================================================================
const urlParams = new URLSearchParams(window.location.search);
const idProdutoEdicao = urlParams.get('edit');
const btnSalvarProduto = document.getElementById('btnSalvarProduto');
const tituloFormProduto = document.getElementById('tituloFormProduto');

if (idProdutoEdicao) {
    // Redireciona visualmente para a aba de formulário de produtos se estiver editando
    const btnAbaProdutos = document.getElementById('btnAbaProdutos');
    if (btnAbaProdutos) {
        alternarAba('aba-produtos', btnAbaProdutos);
    }

    if (tituloFormProduto) tituloFormProduto.innerText = "Editar Produto Existente";
    if (btnSalvarProduto) btnSalvarProduto.innerText = "Salvar Alterações";
    
    const campoImagem = document.getElementById('imagem');
    if (campoImagem) campoImagem.removeAttribute('required');

    fetch(`/api/produtos/${idProdutoEdicao}`)
        .then(response => response.json())
        .then(produto => {
            const dadosProd = produto.dataValues ? produto.dataValues : produto;
            if (dadosProd) {
                document.getElementById('nome').value = dadosProd.nome || '';
                document.getElementById('preco').value = dadosProd.preco || '';
                document.getElementById('estoque').value = dadosProd.estoque || '';
                document.getElementById('descricao').value = dadosProd.descricao || '';
            }
        })
        .catch(err => console.error("Erro ao buscar produto para edição:", err));
}

// Gatilho de inicialização única do DOM
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosNoSelect();
});

const formProduto = document.getElementById('formProduto');
if (formProduto) {
    formProduto.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nome', document.getElementById('nome').value);
        formData.append('preco', document.getElementById('preco').value);
        formData.append('estoque', document.getElementById('estoque').value);
        formData.append('descricao', document.getElementById('descricao').value);
        
        if (document.getElementById('imagem').files[0]) {
            formData.append('imagem', document.getElementById('imagem').files[0]);
        }

        const urlScript = idProdutoEdicao ? `/api/produtos/editar/${idProdutoEdicao}` : '/api/produtos/cadastrar';
        const metodoScript = idProdutoEdicao ? 'PUT' : 'POST';

        fetch(urlScript, { method: metodoScript, body: formData })
        .then(response => {
            if (response.ok) {
                alert(idProdutoEdicao ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                window.location.href = "/admin";
            } else {
                alert('Erro ao salvar o produto.');
            }
        }).catch(err => console.error(err));
    });
}

// =========================================================================
// 🎨 SCRIPT DE CUSTOMIZAÇÃO VISUAL 
// =========================================================================
const formCustomizar = document.getElementById('formCustomizarLoja');
if (formCustomizar) {
    formCustomizar.addEventListener('submit', function(e) {
        e.preventDefault();
        const customData = new FormData();
        customData.append('pagina', document.getElementById('selectPagina').value);
        customData.append('cor_fundo', document.getElementById('corFundo').value);
        customData.append('cor_primaria', document.getElementById('corPrimaria').value);
        
        const arquivoLogo = document.getElementById('logoEmpresa').files[0];
        if (arquivoLogo) {
            customData.append('logo', arquivoLogo);
        }

        fetch('/api/usuarios/layout/config', { method: 'POST', body: customData })
        .then(response => response.json())
        .then(dados => {
            alert(dados.mensagem || "Identidade visual atualizada com sucesso!");
            window.location.reload();
        }).catch(err => console.error(err));
    });
}