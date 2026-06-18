import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as produtoController from '../controllers/produtoController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Caminho corrigido para a pasta pública na raiz do código fonte
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.buscarPorId);
router.post('/cadastrar', upload.single('imagem'), produtoController.cadastrarProduto);
router.put('/editar/:id', upload.single('imagem'), produtoController.atualizarProduto);
router.delete('/excluir/:id', produtoController.excluirProduto);

export default router;