// src/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/finalizar', pedidoController.finalizarPedido);
// NOVA ROTA: Busca os itens do último pedido feito pelo usuário
router.get('/ultimo/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const db = require('../config/database');

        // Query relacional trazendo o nome do produto direto da tabela produto
        const query = `
            SELECT pi.quantidade, pi.preco_unitario, p.nome AS nome_produto 
            FROM pedido_item pi
            JOIN pedido ped ON pi.id_pedido = ped.id_pedido
            JOIN produto p ON pi.id_produto = p.id_produto
            WHERE ped.id_usuario = ? AND ped.id_pedido = (
                SELECT MAX(id_pedido) FROM pedido WHERE id_usuario = ?
            )
        `;

        const [rows] = await db.execute(query, [id_usuario, id_usuario]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar itens do carrinho." });
    }
});

module.exports = router;