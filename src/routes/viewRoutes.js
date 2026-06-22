import { Router } from 'express';
import * as viewController from '../controllers/viewController.js';
import { verificarTokenView, apenasAdminView, verificarTokenOpcional } from '../middlewares/authMiddleware.js';

const router = Router();

// 🔓 Telas totalmente públicas ou com token opcional (Vitrine Aberta)
router.get('/', verificarTokenOpcional, viewController.renderProdutos); 
router.get('/produtos', verificarTokenOpcional, viewController.renderProdutos); 
router.get('/apresentacao', verificarTokenOpcional, viewController.renderHome); 

router.get('/login', viewController.renderLogin);           
router.get('/cadastro', viewController.renderCadastro); 
router.get('/recuperar-senha', viewController.renderRecuperarSenha);

// 🔐 Telas que exigem login obrigatório do cliente
router.get('/meus_pedidos', verificarTokenView, viewController.renderMeusPedidos);
router.get('/carrinho', verificarTokenView, viewController.renderCarrinho); // O carrinho pode ser visto, mas vamos travar a finalização

// 🔐 Telas Administrativas trancadas
router.get('/dashboard', apenasAdminView, viewController.renderDashboard); 
router.get('/gerenciar_admins', apenasAdminView, viewController.renderGerenciarAdmins); 
router.get('/admin', apenasAdminView, viewController.renderAdminPainel);
router.get('/admin.html', apenasAdminView, viewController.renderAdminPainel);

export default router;