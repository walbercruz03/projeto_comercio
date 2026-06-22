 // Carrega os itens salvos no localStorage assim que abre a página
        window.addEventListener('DOMContentLoaded', renderizarCarrinho);

        function renderizarCarrinho() {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            const container = document.getElementById('listaItens');
            const totalContainer = document.getElementById('valorTotal');
            const btnFinalizar = document.getElementById('btnFinalizar');

            if (carrinho.length === 0) {
                container.innerHTML = "<p style='color: #777; padding: 20px 0;'>Seu carrinho está vazio.</p>";
                totalContainer.innerText = "R$ 0,00";
                if(btnFinalizar) btnFinalizar.style.display = 'none';
                return;
            }

            if(btnFinalizar) btnFinalizar.style.display = 'block';
            container.innerHTML = "";
            let totalAcumulado = 0;

            carrinho.forEach(item => {
                const subtotal = item.quantidade * item.preco_unitario;
                totalAcumulado += subtotal;

                container.innerHTML += `
                    <div class="item-carrinho">
                        <div class="item-detalhes">
                            <h4>${item.nome_produto}</h4>
                            <p>Quantidade: ${item.quantidade} x R$ ${item.preco_unitario.toFixed(2)}</p>
                        </div>
                        <div class="item-preco">R$ ${subtotal.toFixed(2)}</div>
                    </div>
                `;
            });

            totalContainer.innerText = `R$ ${totalAcumulado.toFixed(2)}`;
        }

        // DISPARA O PEDIDO EM LOTE COMPLETO PARA O POSTGRES E DEPOIS PARA O WHATSAPP
        function enviarPedidoAoBanco() {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio!");
                return;
            }

            // ⚠️ REVISÃO DE SEGURANÇA: Não enviamos mais o id_usuario fixo ou do sessionStorage no body.
            // O backend (pedidoController.js) já pega o ID real direto do Token JWT decodificado por segurança.
            const dadosPedido = {
                itens: carrinho 
            };

            fetch('/api/pedidos/finalizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPedido)
            })
            .then(res => {
                // 🔒 BLOQUEIO OPEN SPEC: Se a API responder 401 (Não autenticado), barramos aqui
                if (res.status === 401) {
                    alert("Você precisa estar logado para finalizar a sua compra. Redirecionando para a página de login...");
                    window.location.href = "/login";
                    return null; // Cancela a cadeia do .then
                }

                if (res.status === 201) {
                    return res.json();
                } else {
                    throw new Error("Erro ao processar o fechamento do pedido no servidor.");
                }
            })
            .then(dados => {
                if (!dados) return; // Se caiu no 401, interrompe aqui

                // Se salvou no banco com sucesso, gera a mensagem do WhatsApp
                enviarWhatsAppVendedor(carrinho);

                alert("Sucesso! Pedido gravado no banco de dados. Redirecionando para o WhatsApp do vendedor...");
                localStorage.removeItem('carrinho'); // Limpa a memória local do carrinho
                window.location.href = "/meus_pedidos"; // Redireciona para o histórico do cliente
            })
            .catch(err => {
                if (err.message !== "Erro ao processar o fechamento do pedido no servidor.") {
                    console.error("Erro:", err);
                } else {
                    alert(err.message);
                }
            });
        }

        // NOVA FUNÇÃO: Monta o texto e redireciona para o WhatsApp
        function enviarWhatsAppVendedor(itensCarrinho) {
            // 1. Configure aqui o número do vendedor (DDD + Número, sem espaços ou traços)
            // Exemplo: '5584999998888' (55 = Brasil, 84 = RN)
            const numeroVendedor = '5584921495941'; 

            // 2. Monta o corpo da mensagem
            let texto = `🛒 *NOVO PEDIDO CONFIRMADO!*\n`;
            texto += `=========================\n\n`;
            
            let totalGeral = 0;

            itensCarrinho.forEach((item, index) => {
                const subtotal = item.quantidade * item.preco_unitario;
                totalGeral += subtotal;
                
                texto += `*${index + 1}. ${item.nome_produto}*\n`;
                texto += `   Qtd: ${item.quantidade} x R$ ${item.preco_unitario.toFixed(2)}\n`;
                texto += `   Subtotal: R$ ${subtotal.toFixed(2)}\n\n`;
            });

            texto += `=========================\n`;
            texto += `💰 *Total do Pedido: R$ ${totalGeral.toFixed(2)}*\n\n`;
            texto += `📱 _Pedido gerado automaticamente pelo sistema de vendas._`;

            // 3. Codifica o texto para o formato aceito em URLs (transforma espaços em %20, etc.)
            const textoCodificado = encodeURIComponent(texto);

            // 4. Cria o link final da API do WhatsApp
            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${textoCodificado}`;

            // 5. Abre em uma nova aba do navegador para não cortar o fluxo do sistema
            window.open(urlWhatsApp, '_blank');
        }

        function limparCarrinho() {
            localStorage.removeItem('carrinho');
            renderizarCarrinho();
        }