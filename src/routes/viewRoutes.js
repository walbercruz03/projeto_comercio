import express from 'express';
import {
    renderDashboard,
    renderProdutos,
    renderGerenciarAdmins,
    renderCarrinho,
    renderMeusPedidos,
    renderRecuperarSenha,
    renderLogin,
    renderCadastro,
    renderAdminPainel,
    renderCupomPedido // Importa a nova função
} from '../controllers/viewController.js';
import { verificarTokenView, apenasAdminView, verificarTokenOpcional } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas Públicas (ou com verificação opcional)
router.get('/', verificarTokenOpcional, renderProdutos); // Rota raiz agora renderiza a vitrine de produtos diretamente.
router.get('/login', renderLogin);
router.get('/cadastro', renderCadastro);
router.get('/recuperar-senha', renderRecuperarSenha);

// Rotas Protegidas (Exigem login)
router.get('/produtos', verificarTokenView, renderProdutos); // Mantida para compatibilidade de links existentes
router.get('/carrinho', verificarTokenView, renderCarrinho);
router.get('/meus_pedidos', verificarTokenView, renderMeusPedidos);
router.get('/pedidos/cupom/:id', verificarTokenView, renderCupomPedido); // ⚡ ROTA ADICIONADA

// Rotas de Administrador
router.get('/dashboard', apenasAdminView, renderDashboard);
router.get('/admin', apenasAdminView, renderAdminPainel);
router.get('/gerenciar-admins', apenasAdminView, renderGerenciarAdmins);

export default router;