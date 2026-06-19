import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
// IMPORTANTE: Importe o verificarToken de API aqui 👇
import { verificarToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/login', usuarioController.login);
router.post('/cadastro', usuarioController.cadastro);
router.put('/recuperar-senha', usuarioController.recuperarSenha);

// 🔐 Aplique o verificarToken para proteger estas APIs de administração
router.get('/admins', verificarToken, usuarioController.listarAdmins);
router.post('/admins', verificarToken, usuarioController.cadastrarAdmin);
router.put('/admins/:id', verificarToken, usuarioController.atualizarAdmin);
router.delete('/admins/:id', verificarToken, usuarioController.excluirAdmin);

export default router;