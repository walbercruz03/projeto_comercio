document.addEventListener("DOMContentLoaded", () => {
    // O Bloqueio agora é feito pelo Middleware do EJS no servidor.
    // Carrega os dados iniciais do dashboard
    carregarDadosDashboard();
});

function carregarDadosDashboard(dataInicio = '', dataFim = '') {
    let url = '/api/pedidos/dashboard/estatisticas';
    if (dataInicio && dataFim) {
        url += `?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    }

    fetch(url)
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Erro ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(dados => {
            
            // 1. Atualiza os "Cards" do topo
            const totalPedidosEl = document.getElementById('totalPedidos');
            const receitaTotalEl = document.getElementById('receitaTotal');
            
            totalPedidosEl.innerText = dados.resumo.total_pedidos;
            receitaTotalEl.innerText = `R$ ${parseFloat(dados.resumo.receita_total).toFixed(2).replace('.', ',')}`;

            // 2. Prepara os dados para o Gráfico (Chart.js)
            const nomesProdutos = dados.maisVendidos.map(item => item.nome);
            const quantidades = dados.maisVendidos.map(item => item.total_vendido);

            desenharGrafico(nomesProdutos, quantidades);
            
            // 3. Prepara a Tabela Oculta que sairá no PDF de Impressão
            preencherTabelaImpressao(dados.pedidosDetalhados || []);
        })
        .catch(err => {
            console.error("Erro ao carregar os dados:", err);
            alert("Falha no Dashboard:\n" + err.message);
        });
}

function filtrarPorPeriodo() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    if (!dataInicio || !dataFim) {
        alert("Por favor, preencha a data de início e fim para filtrar.");
        return;
    }
    
    carregarDadosDashboard(dataInicio, dataFim);
}

function imprimirRelatorio() {
    // Ao chamar window.print(), o CSS entra em ação, esconde os gráficos e mostra a tabela
    window.print();
}

function preencherTabelaImpressao(pedidos) {
    const tbody = document.getElementById('tabelaRelatorioBody');
    tbody.innerHTML = ''; // Limpa a tabela antes de preencher
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum pedido encontrado para exibir no relatório.</td></tr>';
        return;
    }
    
    pedidos.forEach(pedido => {
        const dataFormatada = new Date(pedido.data_pedido).toLocaleDateString('pt-BR');
        const valorFormatado = parseFloat(pedido.valor_total).toFixed(2).replace('.', ',');
        
        tbody.innerHTML += `
            <tr>
                <td>#${pedido.id_pedido}</td>
                <td>${pedido.nome_cliente || 'Cliente não identificado'}</td>
                <td>${dataFormatada}</td>
                <td>R$ ${valorFormatado}</td>
            </tr>
        `;
    });
}

let chartInstancia = null;

function desenharGrafico(labels, data) {
    const ctx = document.getElementById('graficoMaisVendidos').getContext('2d');
    
    if (chartInstancia) {
        chartInstancia.destroy();
    }

    chartInstancia = new Chart(ctx, {
        type: 'bar', // Tipo barra vertical
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}