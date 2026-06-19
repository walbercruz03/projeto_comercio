document.addEventListener('DOMContentLoaded', () => {
    // =================================================
    // 1. ELEMENTOS DO DOM E ESTADO INICIAL
    // =================================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const btnMenu = document.getElementById('btnMenu');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');

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

    // =================================================
    // 3. FUNÇÕES DE AÇÃO (COMPRAR, EXCLUIR, ETC)
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
                    } else if (res.status === 403) {
                        alert("Acesso negado. Apenas o Administrador Principal pode realizar esta ação.");
                    } else {
                        alert("Erro ao excluir o produto. Verifique suas permissões.");
                    }
                })
                .catch(err => console.error("Erro na requisição:", err));
        }
    };

    // =================================================
    // 4. CONTROLES GERAIS DA UI (MENU, LOGOUT)
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
            // Limpa o cookie limpando o caminho raiz
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            sessionStorage.clear();
            localStorage.removeItem('carrinho');
            localStorage.removeItem('theme');
            
            // CORRIGIDO: Redireciona para a rota amigável do servidor
            window.location.href = "/login"; 
        });
    }
});