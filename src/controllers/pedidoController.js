import Pedido from '../models/pedido.js';

export const finalizarPedido = async (req, res) => {
  try {
    // ⚠️ SEGURANÇA: Pegamos o ID do usuário direto do Token decodificado pelo middleware
   const id_usuario = req.usuario ? (req.usuario.id_usuario || req.usuario.id) : null;
    const { itens } = req.body;

    if (!id_usuario) {
      return res.status(401).json({ erro: "Usuário não autenticado para realizar compras." });
    }

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio. Adicione itens para finalizar o pedido." });
    }

    // Passa o ID real vindo do Postgres para criar o pedido de forma íntegra
    const idPedidoGerado = await Pedido.criarPedidoCompleto(id_usuario, itens);
    res.status(201).json({ mensagem: "Pedido finalizado com sucesso!", id_pedido: idPedidoGerado });
  } catch (error) {
    console.error("❌ Erro ao finalizar pedido:", error);
    res.status(500).json({ erro: "Erro interno ao processar o seu pedido." });
  }
};

export const buscarUltimoPedido = async (req, res) => {
  try {
    // Também podemos garantir que o usuário só veja o último pedido dele mesmo por segurança
    const id_usuario = req.usuario ? req.usuario.id : req.params.id_usuario;
    
    if (!id_usuario) {
      return res.status(400).json({ erro: "ID do usuário não identificado." });
    }

    const itens = await Pedido.buscarUltimoPedidoItens(id_usuario);
    res.json(itens);
  } catch (error) {
    console.error("❌ Erro ao buscar último pedido:", error);
    res.status(500).json({ erro: "Erro ao buscar itens do carrinho." });
  }
};

export const obterDadosDashboard = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query; 
    const dados = await Pedido.buscarDadosDashboard(dataInicio, dataFim);
    res.json(dados);
  } catch (error) {
    console.error("❌ Erro no método obterDadosDashboard:", error);
    res.status(500).json({ erro: "Erro interno ao processar o dashboard." });
  }
};