document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // 1. ELEMENTOS DO DOM E ESTADO INICIAL
    // =================================================
    const emailUsuario = sessionStorage.getItem('emailUsuarioLogado');
    const idUsuarioLogado = sessionStorage.getItem('idUsuarioLogado');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const isAdmin = (tipoUsuario === "admin_principal" || tipoUsuario === "admin");
    const isMainAdmin = (tipoUsuario === "admin_principal");

    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const btnMenu = document.getElementById('btnMenu');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const itensMenu = document.getElementById('itensMenu');
    const perfilUsuario = document.getElementById('perfilUsuario');
    const productGrid = document.getElementById('listaProdutos');
    const categoryContainer = document.getElementById('categoryFilters');

    let allProducts = []; // Armazena todos os produtos para filtragem

    // =================================================
    // 2. LÓGICA DE TEMA (DARK/LIGHT MODE)
    // =================================================
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Aplica o tema salvo ao carregar a página
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // =================================================
    // 3. LÓGICA DE MENU E PERFIL
    // =================================================
    if (isAdmin) {
        perfilUsuario.innerHTML = `<i class="fa-solid fa-user-shield"></i> Administrador`;
        const menuAdmins = isMainAdmin ? `<a href="gerenciar_admins.html"><i class="fa-solid fa-users-gear"></i> Gerenciar Admins</a>` : '';
        itensMenu.innerHTML = `
            <div class="menu-header">Gestão de Produtos</div>
            <a href="admin.html"><i class="fa-solid fa-plus"></i> Cadastrar Produto</a>
            <a href="produtos.html"><i class="fa-solid fa-list-check"></i> Catálogo Detalhado</a>
            <div class="menu-header">Administração</div>
            ${menuAdmins}
            <a href="dashboard.html"><i class="fa-solid fa-chart-line"></i> Dashboard de Vendas</a>
        `;
    } else {
        perfilUsuario.innerHTML = `<i class="fa-solid fa-user"></i> Cliente`;
        itensMenu.innerHTML = `
            <div class="menu-header">Minha Conta</div>
            <a href="carrinho.html"><i class="fa-solid fa-cart-shopping"></i> Meu Carrinho</a>
            <a href="meus_pedidos.html"><i class="fa-solid fa-box-archive"></i> Meus Pedidos</a>
        `;
    }

    // =================================================
    // 4. CARREGAMENTO E RENDERIZAÇÃO DE PRODUTOS
    // =================================================
    fetch('/api/produtos')
        .then(response => response.json())
        .then(produtos => {
            allProducts = produtos;
            renderProducts(allProducts);
            renderCategories(allProducts);
        })
        .catch(err => {
            productGrid.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
            console.error(err);
        });

    function renderProducts(productsToRender) {
        productGrid.innerHTML = "";
        if (productsToRender.length === 0) {
            productGrid.innerHTML = "<p>Nenhum produto encontrado para esta categoria.</p>";
            return;
        }

        productsToRender.forEach(prod => {
            const caminhoImagem = prod.imagem ? `/uploads/${prod.imagem}` : 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400';
            const botoesCard = isAdmin ? `
                <div class="admin-card-actions">
                    <button class="btn-edit" onclick="window.location.href='admin.html?edit=${prod.id_produto}'"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-delete" onclick="excluirProduto(${prod.id_produto}, '${prod.nome}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            ` : `
                <button class="btn-add" onclick="comprarProduto(${prod.id_produto}, '${prod.nome}', ${prod.preco})">
                    <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            `;

            productGrid.innerHTML += `
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
    }

    function renderCategories(products) {
        const categories = ['Todos', ...new Set(products.map(p => p.categoria).filter(Boolean))];
        categoryContainer.innerHTML = categories.map(cat => `<button data-category="${cat}">${cat}</button>`).join('');
        
        const filterButtons = categoryContainer.querySelectorAll('button');
        filterButtons[0].classList.add('active'); // Ativa o botão "Todos" por padrão

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const selectedCategory = button.dataset.category;
                const filteredProducts = selectedCategory === 'Todos' ? allProducts : allProducts.filter(p => p.categoria === selectedCategory);
                renderProducts(filteredProducts);
            });
        });
    }

    // =================================================
    // 5. FUNÇÕES DE AÇÃO (COMPRAR, EXCLUIR, ETC)
    // =================================================
    window.comprarProduto = function(id, nome, preco) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produtoExistente = carrinho.find(item => item.id_produto === id);

        if (produtoExistente) {
            produtoExistente.quantidade++;
        } else {
            carrinho.push({ id_produto: id, nome_produto: nome, preco_unitario: parseFloat(preco), quantidade: 1 });
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        alert(`"${nome}" foi adicionado ao seu carrinho!`);
    };

    window.excluirProduto = function(id, nome) {
        if (confirm(`Tem certeza que deseja excluir permanentemente o produto "${nome}"?`)) {
            fetch(`/api/produtos/excluir/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        alert("Produto removido com sucesso!");
                        window.location.reload();
                    } else {
                        alert("Erro ao excluir o produto.");
                    }
                });
        }
    };

    // =================================================
    // 6. CONTROLES GERAIS DA UI (MENU, LOGOUT)
    // =================================================
    const toggleMenu = () => {
        sidebarMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    };

    btnMenu.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    document.getElementById('btnSair').addEventListener('click', () => {
        sessionStorage.clear();
        localStorage.removeItem('carrinho');
        window.location.href = "index.html";
    });
});