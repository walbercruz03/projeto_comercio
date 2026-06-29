import Pedido from '../models/pedido.js';

export const finalizarPedido = async (req, res) => {
  try {
    // ⚠️ SEGURANÇA: Pegamos o ID do usuário direto do Token decodificado.
   const id_usuario = req.usuario ? req.usuario.id : null;
    const { itens } = req.body;

    // ⚡ CORREÇÃO CRÍTICA: Verifica se o id não é nulo ou indefinido, permitindo o id '0' do admin_principal.
    if (id_usuario === null || id_usuario === undefined) {
      return res.status(401).json({ erro: "Usuário não autenticado para realizar compras." });
    }

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio. Adicione itens para finalizar o pedido." });
    }

    // ⚡ CORREÇÃO CRÍTICA: Se a venda for presencial (feita pelo admin principal com id 0),
    // associamos o pedido a um usuário genérico "Cliente Balcão" (com id 1, por exemplo).
    // Isso evita a violação de chave estrangeira, pois o id 0 não existe na tabela 'usuario'.
    const idUsuarioFinal = (id_usuario === 0) ? 1 : id_usuario;

    // Passa o ID de usuário válido para o modelo criar o pedido.
    const idPedidoGerado = await Pedido.criarPedidoCompleto(idUsuarioFinal, itens);

    res.status(201).json({ mensagem: "Pedido finalizado com sucesso!", id_pedido: idPedidoGerado });
  } catch (error) {
    console.error("❌ Erro ao finalizar pedido:", error);
    // ⚡ MELHORIA: Retorna uma mensagem mais clara e específica se o erro for de chave estrangeira,
    // facilitando o diagnóstico de problemas relacionados a usuários inexistentes.
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      // Esta mensagem agora será exibida no alerta do frontend.
      return res.status(500).json({ erro: 'Erro de integridade: O usuário para o qual o pedido está sendo criado não existe. Verifique se o usuário "Cliente Balcão" (ID 1) foi inserido no banco de dados.' });
    }
    res.status(500).json({ erro: 'Erro interno ao processar o seu pedido.' });
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