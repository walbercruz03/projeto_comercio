// src/routes/usuarioRoutes.js
import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

// Definição dos endpoints
router.post('/login', usuarioController.login);
router.post('/cadastro', usuarioController.cadastro);

// Rotas de Gerenciamento de Admins
router.get('/admins', usuarioController.listarAdmins);
router.post('/admins', usuarioController.cadastrarAdmin);
router.put('/admins/:id', usuarioController.atualizarAdmin);
router.delete('/admins/:id', usuarioController.excluirAdmin);

export default router;