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
        const icon = document.querySelector('label[for="themeToggle"] i');
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
            if (icon) { icon.classList.remove('fa-circle-half-stroke', 'fa-moon'); icon.classList.add('fa-sun'); }
        } else {
            body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
            if (icon) { icon.classList.remove('fa-sun', 'fa-circle-half-stroke'); icon.classList.add('fa-moon'); }
        }
    };

    if (themeToggle) themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Aplica o tema salvo ao carregar a página
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Removida a sobreposição de HTML. O EJS (Backend) fará a montagem segura do Menu e Produtos!

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
        if(sidebarMenu) sidebarMenu.classList.toggle('active');
        if(menuOverlay) menuOverlay.classList.toggle('active');
    };

    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    const btnSair = document.getElementById('btnSair');
    if(btnSair) {
        btnSair.addEventListener('click', () => {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            sessionStorage.clear();
            localStorage.removeItem('carrinho');
            localStorage.removeItem('theme'); // Limpa a preferência do tema ao sair
            window.location.href = "/index.html";
        });
    }
});