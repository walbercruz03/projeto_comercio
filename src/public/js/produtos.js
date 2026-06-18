// ==========================================
// FUNÇÕES DE AÇÃO DOS BOTÕES
// A renderização do HTML agora é feita de forma segura no backend (EJS).
// ==========================================

function editarProduto(id) {
    window.location.href = `admin.html?edit=${id}`;
}

function excluirProduto(id, nome) {
    if (confirm(`Tem certeza que deseja excluir permanentemente o produto "${nome}"?`)) {
        fetch(`/api/produtos/excluir/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.status === 200) {
                alert("Produto removido com sucesso do banco de dados!");
                window.location.reload(); // Recarrega a página atualizada
            } else {
                alert("Erro ao excluir o produto.");
            }
        })
        .catch(err => console.error("Erro:", err));
    }
}

function adicionarAoCarrinho(id, nome, preco) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const produtoExistente = carrinho.find(item => item.id_produto === id);

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({ id_produto: id, nome_produto: nome, preco_unitario: parseFloat(preco), quantidade: 1 });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`O produto "${nome}" foi adicionado ao seu carrinho!`);
}

function fazerLogout() {
    // Destrói o Cookie JWT de sessão do Node.js
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Limpa a memória do navegador
    sessionStorage.clear();
    localStorage.removeItem('carrinho');
    localStorage.removeItem('theme'); // Limpa a preferência do tema ao sair
    
    // Redireciona de volta para a tela inicial pública
    window.location.href = "/index.html"; 
}