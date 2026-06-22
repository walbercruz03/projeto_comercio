import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import * as configuracaoController from '../controllers/configuracaoController.js'; // 🆕 Importando o novo controller
import { verificarToken } from '../middlewares/authMiddleware.js'; 
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 📁 Configuração do Multer para salvar a logo corporativa na pasta uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Rotas de Autenticação Públicas ---
router.post('/login', usuarioController.login);
router.post('/cadastro', usuarioController.cadastro);
router.put('/recuperar-senha', usuarioController.recuperarSenha);

// --- Rotas de Gerenciamento de Admins (Protegidas) ---
router.get('/admins', verificarToken, usuarioController.listarAdmins);
router.post('/admins', verificarToken, usuarioController.cadastrarAdmin);
router.put('/admins/:id', verificarToken, usuarioController.atualizarAdmin);
router.delete('/admins/:id', verificarToken, usuarioController.excluirAdmin);

// --- 🆕 Novas Rotas de Customização Visual da Loja (OpenSpec Fase 2) ---
// Qualquer usuário (inclusive clientes deslogados) pode ler as cores e a logo para aplicar no layout
router.get('/layout/config', configuracaoController.obterConfiguracoes);

// Apenas administradores autenticados podem salvar novas definições visuais
router.post('/layout/config', verificarToken, upload.single('logo'), configuracaoController.salvarConfiguracoes);

export default router;