// 1. Identifica se o usuário logado é o administrador baseado no e-mail que salvamos no login
        // Para testar sem login, você pode forçar como true mudando para: const isAdmin = true;
        const emailUsuario = sessionStorage.getItem('emailUsuarioLogado'); 
        const tipoUsuario = sessionStorage.getItem('tipoUsuario');
        const isAdmin = (tipoUsuario === "admin_principal" || tipoUsuario === "admin" || emailUsuario === "admin@gmail.com");

        window.addEventListener('DOMContentLoaded', () => {
            const statusPainel = document.getElementById('statusPainel');
            
            // Mostra um indicador visual no topo caso seja Admin
            if (isAdmin) {
                statusPainel.innerHTML = `
                    <span class="badge-admin"><i class="fa-solid fa-user-gear"></i> Modo Administrador Ativo</span>
                    <button onclick="window.location.href='admin.html'" style="margin-left: 15px; padding: 5px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"><i class="fa-solid fa-plus"></i> Criar Novo Produto</button>
                `;
            }

            // Busca os produtos direto do banco de dados no Docker
            fetch('/api/produtos')
                .then(response => response.json())
                .then(produtos => {
                    const container = document.getElementById('listaProdutos');
                    
                    if(produtos.length === 0) {
                        container.innerHTML = "<p>Nenhum produto cadastrado no estoque.</p>";
                        return;
                    }

                    produtos.forEach(prod => {
                        // Se o produto tiver imagem salva no banco, usa ela, senão usa uma padrão do Unsplash
                        const caminhoImagem = prod.imagem ? `/uploads/${prod.imagem}` : 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400';

                        // MÁGICA DO FRONT-END: Define quais botões renderizar com base no tipo de usuário
                        let botoesCard = '';
                        
                        if (isAdmin) {
                            // Se for admin, renderiza Editar e Excluir
                            botoesCard = `
                                <div class="admin-actions">
                                    <button class="btn-edit" onclick="editarProduto(${prod.id_produto})">
                                        <i class="fa-solid fa-pen-to-square"></i> Editar
                                    </button>
                                    <button class="btn-delete" onclick="excluirProduto(${prod.id_produto}, '${prod.nome}')">
                                        <i class="fa-solid fa-trash"></i> Excluir
                                    </button>
                                </div>
                            `;
                        } else {
                            // Se for cliente, renderiza o botão normal de compra
                            botoesCard = `
                                <button class="btn-comprar" onclick="adicionarAoCarrinho(${prod.id_produto})">
                                    <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
                                </button>
                            `;
                        }

                        // Monta o card estruturado na tela
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
                })
                .catch(err => console.error("Erro ao carregar produtos:", err));
        });

        // ==========================================
        // FUNÇÕES DE AÇÃO DO ADMINISTRADOR
        // ==========================================

        function editarProduto(id) {
            window.location.href = `admin.html?edit=${id}`;
        }

        function excluirProduto(id, nome) {
            if (confirm(`Tem certeza que deseja excluir permanentemente o produto "${nome}"?`)) {
                // Dispara a rota DELETE para o seu Node.js remover do MySQL do Docker
                fetch(`/api/produtos/excluir/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        alert("Produto removido com sucesso do banco de dados!");
                        window.location.reload(); // Recarrega a vitrine atualizada
                    } else {
                        alert("Erro ao excluir o produto.");
                    }
                })
                .catch(err => console.error("Erro:", err));
            }
        }

        function adicionarAoCarrinho(id) {
            alert(`Produto ${id} adicionado ao carrinho do cliente!`);
        }