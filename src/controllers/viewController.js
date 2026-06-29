import Produto from '../models/produto.js'; 
import Pedido from '../models/pedido.js';
import { Administrador, Configuracao } from '../config/orm.js'; // 🆕 Importa o modelo Configuracao

// 🆕 FUNÇÃO AUXILIAR: Busca o layout atual no banco para injetar nas views EJS
const obterLayout = async () => {
    try {
        const dados = await Configuracao.findAll({ raw: true });
        const layout = dados.reduce((acc, item) => {
            acc[item.chave] = item.valor;
            return acc;
        }, {});

        // Retorna um mapeamento individual para cada tela do sistema
        return {
            logo_url: layout.logo_url || '/images/logo-placeholder.png',
            cor_primaria: layout.cor_primaria || '#0d6efd',
            // Fundos específicos por página (caso não existam, usam #ffffff)
            cor_fundo_produtos: layout.cor_fundo_produtos || '#ffffff',
            cor_fundo_carrinho: layout.cor_fundo_carrinho || '#ffffff',
            cor_fundo_login: layout.cor_fundo_login || '#ffffff',
            cor_fundo_cadastro: layout.cor_fundo_cadastro || '#ffffff',
            cor_fundo_dashboard: layout.cor_fundo_dashboard || '#ffffff'
        };
    } catch (error) {
        console.error("⚠️ Erro ao carregar layout do banco:", error);
        return {
            logo_url: '/images/logo-placeholder.png',
            cor_primaria: '#0d6efd',
            cor_fundo_produtos: '#ffffff',
            cor_fundo_carrinho: '#ffffff',
            cor_fundo_login: '#ffffff',
            cor_fundo_cadastro: '#ffffff',
            cor_fundo_dashboard: '#ffffff'
        };
    }
};

export const renderDashboard = async (req, res) => {
    try {
        const dados = await Pedido.buscarDadosDashboard(null, null);
        const layout = await obterLayout(); // 🆕 Carrega layout

        res.render('dashboard', {
            resumo: dados.resumo || { total_pedidos: 0, receita_total: 0 },
            maisVendidos: dados.maisVendidos || [],
            pedidosDetalhados: dados.pedidosDetalhados || [],
            layout // 🆕 Injeta na view
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
        const usuarioLogado = req.usuario || null; 
        const layout = await obterLayout(); // 🆕 Carrega layout
        
        res.render('produtos', { produtos: produtos || [], isAdmin, usuarioLogado, layout });
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
        const layout = await obterLayout(); // 🆕 Carrega layout

        res.render('gerenciar_admins', { admins, usuarioLogado, layout });
    } catch (error) {
        console.error("❌ Erro ao renderizar Gestão de Admins:", error);
        res.status(500).send("Erro interno ao carregar Administradores.");
    }
};

export const renderCarrinho = async (req, res) => {
    try {
        const layout = await obterLayout(); // 🆕 Carrega layout
        res.render('carrinho', { layout }); 
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
        const layout = await obterLayout(); // 🆕 Carrega layout

        res.render('meus_pedidos', { usuarioLogado: !!userId, pedidos: pedidos || [], layout });
    } catch (error) {
        console.error("❌ Erro ao renderizar Meus Pedidos:", error);
        res.status(500).send("Erro interno ao carregar Pedidos.");
    }
};

export const renderRecuperarSenha = async (req, res) => {
    const layout = await obterLayout();
    res.render('recuperar_senha', { layout }); 
};

export const renderLogin = async (req, res) => {
    const layout = await obterLayout();
    res.render('login', { layout }); 
};

export const renderCadastro = async (req, res) => {
    const layout = await obterLayout();
    res.render('cadastro', { layout }); 
};

export const renderAdminPainel = async (req, res) => {
    try {
        const layout = await obterLayout(); // 🆕 Carrega layout
        // ⚡ CORREÇÃO CRÍTICA: Garante que o usuário logado seja injetado na view do admin.
        // Isso confirma que o middleware de autenticação foi executado antes de renderizar a página,
        // o que é essencial para as chamadas de API subsequentes funcionarem.
        res.render('admin', { layout, usuarioLogado: req.usuario || null }); 
    } catch (error) {
        console.error("❌ Erro ao renderizar Painel do Admin:", error);
        res.status(500).send("Erro interno ao carregar a página de administração.");
    }
};

// ⚡ NOVO: Renderiza a página de impressão de um pedido específico.
export const renderCupomPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.buscarPedidosPorUsuario(null, id); // Reutiliza a busca, mas para um ID específico

        if (!pedido || pedido.length === 0) {
            return res.status(404).send("Pedido não encontrado.");
        }

        // A função buscarPedidosPorUsuario retorna um array, pegamos o primeiro elemento.
        res.render('cupom', { pedido: pedido[0] });
    } catch (error) {
        console.error("❌ Erro ao renderizar cupom do pedido:", error);
        res.status(500).send("Erro interno ao gerar o cupom do pedido.");
    }
};