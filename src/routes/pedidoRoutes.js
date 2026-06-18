import express from 'express';
import * as pedidoController from '../controllers/pedidoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; // 👈 1. Importe o middleware aqui

const router = express.Router();

// 👈 2.  verificarToken antes de chamar o controller!
router.post('/finalizar', verificarToken, pedidoController.finalizarPedido);

router.get('/ultimo/:id_usuario', pedidoController.buscarUltimoPedido);
router.get('/dashboard/estatisticas', pedidoController.obterDadosDashboard);

export default router;