// Ajuste os imports abaixo se os seus arquivos na pasta models terminarem com "Model.js"
import Produto from '../models/produto.js'; 
import Pedido from '../models/pedido.js';
// Buscamos o Administrador direto do orm para facilitar a listagem limpa na view
import { Administrador } from '../config/orm.js'; 

export const renderDashboard = async (req, res) => {
    try {
        const dados = await Pedido.buscarDadosDashboard(null, null);
        // Garante que se o modelo vier vazio por falta de pedidos, a página não quebre
        res.render('dashboard', {
            resumo: dados.resumo || { total_pedidos: 0, receita_total: 0 },
            maisVendidos: dados.maisVendidos || [],
            pedidosDetalhados: dados.pedidosDetalhados || []
        });
    } catch (error) {
        console.error("❌ Erro ao renderizar Dashboard:", error);
        res.status(500).send("Erro interno ao carregar a página do Dashboard.");
    }
};

export const renderProdutos = async (req, res) => {
    try {
        const produtos = await Produto.listarTodos();
        
        // Lê direto do token JWT se existe a permissão
        const isAdmin = req.usuario && (req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'admin_principal' || req.usuario.email === 'admin@gmail.com');
        
        res.render('produtos', { produtos: produtos || [], isAdmin });
    } catch (error) {
        console.error("❌ Erro ao renderizar Produtos:", error);
        res.status(500).send("Erro interno ao carregar os Produtos.");
    }
};

export const renderGerenciarAdmins = async (req, res) => {
    try {
        // Busca os administradores direto pelo Sequelize de forma simples e limpa para a tela
        const adminsRaw = await Administrador.findAll({ raw: true });
        
        const admins = adminsRaw.map(admin => ({
            id_usuario: admin.id_admin,
            nome: admin.nome,
            email: admin.email,
            tipo_usuario: 'admin'
        }));

        // Passa a flag isAdmin para a view saber qual menu renderizar
        const isAdmin = true; // A rota já é protegida pelo middleware 'apenasAdmin'

        res.render('gerenciar_admins', { admins, isAdmin });
    } catch (error) {
        console.error("❌ Erro ao renderizar Gestão de Admins:", error);
        res.status(500).send("Erro interno ao carregar Administradores.");
    }
};

export const renderMeusPedidos = async (req, res) => {
    try {
        // Lê direto do token JWT o ID real do usuário conectado
        const userId = req.usuario ? req.usuario.id : null;
        let pedidos = [];

        if (userId) {
            // Busca os pedidos reais do usuário caso o ID venha na URL
            pedidos = await Pedido.buscarPedidosPorUsuario(userId);
        }

        res.render('meus_pedidos', { 
            usuarioLogado: !!userId, 
            pedidos: pedidos || [] 
        });
    } catch (error) {
        console.error("❌ Erro ao renderizar Meus Pedidos:", error);
        res.status(500).send("Erro interno ao carregar Pedidos.");
    }
};