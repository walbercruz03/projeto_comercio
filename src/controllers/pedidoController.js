import Pedido from '../models/pedido.js';

export const finalizarPedido = async (req, res) => {
  try {
    const { id_usuario, itens } = req.body;
    if (!id_usuario || !itens || itens.length === 0) {
      return res.status(400).json({ erro: "Dados do pedido incompletos ou carrinho vazio." });
    }

    const idPedidoGerado = await Pedido.criarPedidoCompleto(id_usuario, itens);
    res.status(201).json({ mensagem: "Pedido finalizado com sucesso!", id_pedido: idPedidoGerado });
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    res.status(500).json({ erro: "Erro interno ao processar o seu pedido." });
  }
};

export const buscarUltimoPedido = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const itens = await Pedido.buscarUltimoPedidoItens(id_usuario);
    res.json(itens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar itens do carrinho." });
  }
};

export const obterDadosDashboard = async (req, res) => {
  try {
    const dados = await Pedido.buscarDadosDashboard();
    res.json(dados);
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    res.status(500).json({ erro: "Erro interno ao processar o dashboard." });
  }
};