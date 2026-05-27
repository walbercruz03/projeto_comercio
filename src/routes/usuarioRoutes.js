// src/routes/usuarioRoutes.js
import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

// Definição dos endpoints
router.post('/login', usuarioController.login);
router.post('/cadastro', usuarioController.cadastro);

export default router;