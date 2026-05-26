// src/routes/produtoRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// IMPORTANTE: Importar o controller para as funções de busca e edição funcionarem!
const produtoController = require('../controllers/produtoController');

// Configuração do destino e nome do arquivo de imagem com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // As imagens dos produtos ficarão salvas na pasta public/uploads
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    // Define um nome único usando a data atual para evitar arquivos duplicados
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 1. Rota de listagem geral (Vitrine)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM produto');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar produtos." });
    }
});

// 2. Rota para buscar um único produto por ID (Usada no carregamento da edição)
router.get('/:id', produtoController.buscarPorId);

// 3. Rota de Cadastro de novos produtos
router.post('/cadastrar', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, preco, estoque, descricao } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ erro: "A imagem do produto é obrigatória." });
        }

        // Nome do arquivo salvo na pasta uploads (Ex: 17165849302-948392.jpg)
        const nomeImagem = req.file.filename; 

        // AJUSTE: Incluída a coluna 'imagem' na query para salvar o nome do arquivo no MySQL
        const query = 'INSERT INTO produto (nome, preco, estoque, descricao, imagem) VALUES (?, ?, ?, ?, ?)';
        await db.execute(query, [nome, preco, estoque, descricao, nomeImagem]);

        res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", imagem: nomeImagem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno ao salvar produto." });
    }
}); // <--- Agora a rota cadastrar fecha certinho aqui!

// 4. Rota para salvar as alterações do produto editado (PUT)
router.put('/editar/:id', upload.single('imagem'), produtoController.atualizarProduto);

// 5. Rota para excluir o produto (DELETE)
router.delete('/excluir/:id', produtoController.excluirProduto);

module.exports = router;