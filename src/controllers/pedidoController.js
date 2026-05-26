// src/controllers/pedidoController.js
const Pedido = require('../models/pedido');

exports.finalizarPedido = async (req, res) => {
  try {
    const { id_usuario, itens } = req.body;

    // Validações básicas
    if (!id_usuario || !itens || itens.length === 0) {
      return res.status(400).json({ erro: "Dados do pedido incompletos ou carrinho vazio." });
    }

    // Chama o model para rodar a transação no banco
    const idPedidoGerado = await Pedido.criarPedidoCompleto(id_usuario, itens);

    res.status(201).json({ 
      mensagem: "Pedido finalizado com sucesso!", 
      id_pedido: idPedidoGerado 
    });

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    res.status(500).json({ erro: "Erro interno ao processar o seu pedido." });
  }
};