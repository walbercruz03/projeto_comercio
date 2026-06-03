import express from 'express';
import * as pedidoController from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/finalizar', pedidoController.finalizarPedido);
router.get('/ultimo/:id_usuario', pedidoController.buscarUltimoPedido);
router.get('/dashboard/estatisticas', pedidoController.obterDadosDashboard);

export default router;