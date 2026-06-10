document.addEventListener('DOMContentLoaded', () => {
    const idUsuarioLogado = sessionStorage.getItem('idUsuarioLogado');
    const listaPedidosContainer = document.getElementById('listaPedidos');

    // Segurança: Se não houver cliente logado, não há o que mostrar
    if (!idUsuarioLogado) {
        listaPedidosContainer.innerHTML = '<p>Você precisa estar logado para ver seus pedidos. <a href="index.html">Faça o login</a>.</p>';
        return;
    }

    // Mostra uma mensagem de carregamento
    listaPedidosContainer.innerHTML = '<p>Buscando seu histórico de pedidos...</p>';

    // Busca os pedidos do usuário específico no backend
    fetch(`/api/pedidos/usuario/${idUsuarioLogado}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar pedidos.');
            }
            return response.json();
        })
        .then(pedidos => {
            if (pedidos.length === 0) {
                listaPedidosContainer.innerHTML = '<p style="text-align: center; color: #666;">Você ainda não fez nenhum pedido.</p>';
                return;
            }

            // Limpa o container antes de adicionar os pedidos
            listaPedidosContainer.innerHTML = '';

            pedidos.forEach(pedido => {
                const dataPedido = new Date(pedido.data_pedido).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                // Monta a lista de itens para cada pedido
                const itensHtml = pedido.itens.map(item => `
                    <div class="pedido-item">
                        <span>${item.quantidade}x ${item.nome_produto}</span>
                        <span>R$ ${parseFloat(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                    </div>
                `).join('');

                // Cria o card completo do pedido
                const pedidoCardHtml = `
                    <div class="pedido-card">
                        <div class="pedido-header">
                            <h3>Pedido #${pedido.id_pedido}</h3>
                            <span>${dataPedido}</span>
                        </div>
                        <div class="pedido-body">
                            ${itensHtml}
                        </div>
                        <div class="pedido-footer">
                            Total: R$ ${parseFloat(pedido.valor_total).toFixed(2)}
                        </div>
                    </div>
                `;

                listaPedidosContainer.innerHTML += pedidoCardHtml;
            });
        })
        .catch(error => {
            console.error('Erro ao carregar pedidos:', error);
            listaPedidosContainer.innerHTML = '<p style="color: red; text-align: center;">Ocorreu um erro ao buscar seus pedidos. Tente novamente mais tarde.</p>';
        });
});