  // 1. Identificação do Perfil logado
        const emailUsuario = sessionStorage.getItem('emailUsuarioLogado');
        const idUsuarioLogado = sessionStorage.getItem('idUsuarioLogado') || 1;
        const isAdmin = (emailUsuario === "admin@gmail.com");

        // 2. Elementos da Tela
        const btnMenu = document.getElementById('btnMenu');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const itensMenu = document.getElementById('itensMenu');
        const perfilUsuario = document.getElementById('perfilUsuario');
        const boasVindasTitulo = document.getElementById('boasVindasTitulo');

        // 3. Montar Menu Lateral de Acordo com o Perfil
        if (isAdmin) {
            perfilUsuario.innerHTML = '<i class="fa-solid fa-user-gear"></i> Admin';
            perfilUsuario.style.backgroundColor = '#dc3545';
            boasVindasTitulo.innerHTML = 'Painel Administrativo';

            itensMenu.innerHTML = `
                <div class="menu-header">Gerenciamento</div>
                <a href="admin.html"><i class="fa-solid fa-plus"></i> Criar Produto</a>
                <a href="produtos.html"><i class="fa-solid fa-list-check"></i> Gerenciar Catálogo</a>
                <div class="menu-header">Relatórios</div>
                <a href="dashboard.html"><i class="fa-solid fa-chart-line"></i> Vendas / Pedidos</a>
            `;
        } else {
            perfilUsuario.innerHTML = '<i class="fa-solid fa-user"></i> Cliente';
            itensMenu.innerHTML = `
                <div class="menu-header">Navegação</div>
                <a href="apresentacao.html"><i class="fa-solid fa-box-open"></i> Ver Todos Produtos</a>
                <a href="carrinho.html"><i class="fa-solid fa-cart-shopping"></i> Meu Carrinho</a>
                <a href="apresentacao.html"><i class="fa-solid fa-bag-shopping"></i> Comprar Destaques</a>
            `;
        }

        // 4. Buscar e Renderizar os Produtos na Página Principal
        window.addEventListener('DOMContentLoaded', () => {
            fetch('/api/produtos')
                .then(response => response.json())
                .then(produtos => {
                    const container = document.getElementById('listaProdutos');
                    if(produtos.length === 0) {
                        container.innerHTML = "<p>Nenhum produto cadastrado no estoque.</p>";
                        return;
                    }

                    produtos.forEach(prod => {
                        const caminhoImagem = prod.imagem ? `/uploads/${prod.imagem}` : 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400';
                        
                        // Define botões do card baseado no perfil
                        let botoesCard = '';
                        if (isAdmin) {
                            botoesCard = `
                                <div class="admin-card-actions">
                                    <button class="btn-edit" onclick="window.location.href='admin.html?edit=${prod.id_produto}'">Editar</button>
                                    <button class="btn-delete" onclick="excluirProduto(${prod.id_produto}, '${prod.nome}')">Excluir</button>
                                </div>
                            `;
                        } else {
                            botoesCard = `
                                <button class="btn-add" onclick="comprarProduto(${prod.id_produto}, '${prod.nome}', ${prod.preco})">
                                    <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
                                </button>
                            `;
                        }

                        container.innerHTML += `
                            <div class="card-produto">
                                <img src="${caminhoImagem}" alt="${prod.nome}">
                                <div class="produto-info">
                                    <h3>${prod.nome}</h3>
                                    <p>${prod.descricao}</p>
                                    <div class="preco">R$ ${parseFloat(prod.preco).toFixed(2)}</div>
                                    ${botoesCard}
                                </div>
                            </div>
                        `;
                    });
                });
        });

        // 5. Funções de Ação
        function comprarProduto(id, nome, preco) {
            // Pega o carrinho atual do localStorage ou cria um array vazio
            let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

            // Verifica se o produto já está no carrinho
            const produtoExistente = extinction = carrinho.find(item => item.id_produto === id);

            if (produtoExistente) {
                produtoExistente.quantidade += 1;
            } else {
                carrinho.push({
                    id_produto: id,
                    nome_produto: nome,
                    preco_unitario: parseFloat(preco),
                    quantidade: 1
                });
            }

            // Salva o carrinho atualizado de volta na memória do navegador
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            alert(`"${nome}" adicionado ao carrinho!`);
        }

        function excluirProduto(id, nome) {
            if (confirm(`Excluir permanentemente "${nome}"?`)) {
                fetch(`/api/produtos/excluir/${id}`, { method: 'DELETE' })
                .then(res => { if(res.status === 200) window.location.reload(); });
            }
        }

        // 6. Efeitos do Menu Sidebar
        function toggleMenu() {
            sidebarMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        }
        btnMenu.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);

        // Botão Sair (Limpa a sessão e volta para o login)
        document.getElementById('btnSair').addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = "index.html";
        });