import Produto from '../models/produto.js'; 
import Pedido from '../models/pedido.js';
import { Administrador } from '../config/orm.js'; 

export const renderDashboard = async (req, res) => {
    try {
        const dados = await Pedido.buscarDadosDashboard(null, null);
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
        const isAdmin = req.usuario && (req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'admin_principal');
        res.render('produtos', { produtos: produtos || [], isAdmin });
    } catch (error) {
        console.error("❌ Erro ao renderizar Produtos:", error);
        res.status(500).send("Erro interno ao carregar os Produtos.");
    }
};

export const renderGerenciarAdmins = async (req, res) => {
    try {
        const adminsRaw = await Administrador.findAll({ raw: true });
        const admins = adminsRaw.map(admin => ({
            id_usuario: admin.id_admin,
            nome: admin.nome,
            email: admin.email,
            tipo_usuario: 'admin'
        }));
        const usuarioLogado = req.usuario || null;
        res.render('gerenciar_admins', { admins, usuarioLogado });
    } catch (error) {
        console.error("❌ Erro ao renderizar Gestão de Admins:", error);
        res.status(500).send("Erro interno ao carregar Administradores.");
    }
};

// 🆕 RENDERIZADOR DA TELA DO CARRINHO DE COMPRAS
export const renderCarrinho = (req, res) => {
    try {
        // Renderiza o ficheiro carrinho.ejs que deve estar na sua pasta views
        res.render('carrinho'); 
    } catch (error) {
        console.error("❌ Erro ao renderizar Carrinho:", error);
        res.status(500).send("Erro interno ao carregar o seu carrinho de compras.");
    }
};

export const renderMeusPedidos = async (req, res) => {
    try {
        const userId = req.usuario ? req.usuario.id : null;
        let pedidos = [];
        if (userId) {
            pedidos = await Pedido.buscarPedidosPorUsuario(userId);
        }
        res.render('meus_pedidos', { usuarioLogado: !!userId, pedidos: pedidos || [] });
    } catch (error) {
        console.error("❌ Erro ao renderizar Meus Pedidos:", error);
        res.status(500).send("Erro interno ao carregar Pedidos.");
    }
};

export const renderRecuperarSenha = (req, res) => {
    res.render('recuperar_senha'); 
};

export const renderLogin = (req, res) => {
    res.render('login'); 
};

export const renderHome = (req, res) => {
    res.render('apresentacao'); 
};

export const renderCadastro = (req, res) => {
    res.render('cadastro'); 
};

// 🆕 RENDERIZADOR DA TELA DE GERENCIAMENTO/CADASTRO DE PRODUTOS (admin.ejs)
export const renderAdminPainel = (req, res) => {
    try {
        res.render('admin'); 
    } catch (error) {
        console.error("❌ Erro ao renderizar Painel do Admin:", error);
        res.status(500).send("Erro interno ao carregar a página de administração.");
    }
};