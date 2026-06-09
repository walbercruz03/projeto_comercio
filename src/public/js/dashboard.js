document.addEventListener("DOMContentLoaded", () => {
    // Segurança Básica: Verifica se é o Admin mesmo acessando
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const emailUsuario = sessionStorage.getItem('emailUsuarioLogado');
    if (tipoUsuario !== "admin_principal" && tipoUsuario !== "admin" && emailUsuario !== "admin@gmail.com") {
        alert("Acesso negado! Apenas administradores podem ver o dashboard.");
        window.location.href = "apresentacao.html";
        return;
    }

    // Carrega os dados da nossa nova rota
    fetch('/api/pedidos/dashboard/estatisticas')
        .then(res => res.json())
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
        })
        .catch(err => {
            console.error("Erro ao carregar os dados:", err);
            alert("Erro ao conectar com o banco de dados.");
        });
});

function desenharGrafico(labels, data) {
    const ctx = document.getElementById('graficoMaisVendidos').getContext('2d');
    
    new Chart(ctx, {
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