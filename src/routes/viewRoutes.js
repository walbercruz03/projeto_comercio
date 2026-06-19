import { Router } from 'express';
import * as viewController from '../controllers/viewController.js';
import { verificarTokenView, apenasAdminView, verificarTokenOpcional } from '../middlewares/authMiddleware.js';

const router = Router();

// 🔐 Telas Administrativas trancadas (redirecionam para o login se falhar)
router.get('/dashboard', apenasAdminView, viewController.renderDashboard); 
router.get('/gerenciar_admins', apenasAdminView, viewController.renderGerenciarAdmins); 

// 🆕 ROTAS DO PAINEL DO ADMIN (Cadastrar/Editar Produtos)
router.get('/admin', apenasAdminView, viewController.renderAdminPainel);
router.get('/admin.html', apenasAdminView, viewController.renderAdminPainel); // Compatibilidade com links .html antigos

// 🛒 Catálogo e Pedidos exigem login do cliente
router.get('/produtos', verificarTokenView, viewController.renderProdutos); 
router.get('/meus_pedidos', verificarTokenView, viewController.renderMeusPedidos);
router.get('/carrinho', verificarTokenView, viewController.renderCarrinho);

// 🔓 Telas totalmente públicas
router.get('/', viewController.renderLogin); 
router.get('/login', viewController.renderLogin);           
router.get('/cadastro', viewController.renderCadastro); 
router.get('/apresentacao', verificarTokenOpcional, viewController.renderHome); 
router.get('/recuperar-senha', viewController.renderRecuperarSenha);

export default router;