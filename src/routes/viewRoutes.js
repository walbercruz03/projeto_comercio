import express from 'express';
import * as viewController from '../controllers/viewController.js';
import { verificarToken, apenasAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Roteamento das telas dinâmicas do sistema
router.get('/dashboard', apenasAdmin, viewController.renderDashboard); // 👈 Protegido a nível de Servidor!
router.get('/produtos', verificarToken, viewController.renderProdutos); // 👈 Verifica quem é mas não bloqueia
router.get('/gerenciar_admins', apenasAdmin, viewController.renderGerenciarAdmins); // 👈 Protegido!
router.get('/meus_pedidos', verificarToken, viewController.renderMeusPedidos);

// Exemplo para quando migrar a tela inicial estática (index.html) para EJS:
// router.get('/', viewController.renderHome);

export default router;