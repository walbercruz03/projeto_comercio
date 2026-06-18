import { sequelize, Pedido as PedidoORM, PedidoItem, Produto as ProdutoORM, Usuario } from '../config/orm.js';
import { Op } from 'sequelize';

const Pedido = {
  buscarPedidosPorUsuario: async (id_usuario) => {
    // 1. Busca todos os pedidos do usuário
    const pedidos = await PedidoORM.findAll({
      where: { id_usuario },
      order: [['data_pedido', 'DESC']],
      raw: true
    });

    if (pedidos.length === 0) return [];

    // 2. Extrai itens correspondentes a esses pedidos
    const idsPedidos = pedidos.map(p => p.id_pedido);
    const itensQuery = await PedidoItem.findAll({
      where: { id_pedido: { [Op.in]: idsPedidos } },
      include: [{ model: ProdutoORM, attributes: ['nome'] }],
      raw: true
    });

    // 3. Agrupa itens por ID do pedido para não sobrecarregar
    const itensPorPedido = itensQuery.reduce((acc, item) => {
      if (!acc[item.id_pedido]) acc[item.id_pedido] = [];
      acc[item.id_pedido].push({
        nome_produto: item['produto.nome'] || item['Produto.nome'] || 'Produto',
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      });
      return acc;
    }, {});

    return pedidos.map(p => {
      const itens = itensPorPedido[p.id_pedido] || [];
      const valorTotal = itens.reduce((soma, i) => soma + (Number(i.quantidade) * Number(i.preco_unitario)), 0);
      return {
        id_pedido: p.id_pedido,
        data_pedido: p.data_pedido,
        valor_total: valorTotal,
        itens: itens
      };
    });
  },

  buscarUltimoPedidoItens: async (id_usuario) => {
    const ultimoPedido = await PedidoORM.findOne({
      where: { id_usuario },
      order: [['id_pedido', 'DESC']],
      attributes: ['id_pedido']
    });

    if (!ultimoPedido) return [];

    return await PedidoItem.findAll({
      where: { id_pedido: ultimoPedido.id_pedido },
      include: [{ model: ProdutoORM, attributes: ['nome'] }],
      raw: true
    });
  },

  criarPedidoCompleto: async (id_usuario, itens) => {
    const transaction = await sequelize.transaction();
    try {
      const novoPedido = await PedidoORM.create({ id_usuario }, { transaction });
      
      for (const item of itens) {
        await PedidoItem.create({
          id_pedido: novoPedido.id_pedido,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: Number(item.preco_unitario)
        }, { transaction });

        await ProdutoORM.decrement('estoque', { 
          by: item.quantidade, 
          where: { id_produto: item.id_produto }, 
          transaction 
        });
      }

      await transaction.commit();
      return novoPedido.id_pedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  buscarDadosDashboard: async (dataInicio, dataFim) => {
    try {
      const whereClause = {};
      if (dataInicio && dataFim) {
        whereClause.data_pedido = {
          [Op.between]: [dataInicio, `${dataFim} 23:59:59`]
        };
      }

      // 1. Busca todos os pedidos do período selecionado
      const pedidos = await PedidoORM.findAll({ where: whereClause, raw: true });
      const totalPedidos = pedidos.length;

      if (totalPedidos === 0) {
        return { 
          resumo: { total_pedidos: 0, receita_total: 0 }, 
          maisVendidos: [], 
          pedidosDetalhados: [] 
        };
      }

      // 2. Extrai IDs para buscas limpas (Evita JOINs complexos no Postgres)
      const idsPedidos = pedidos.map(p => p.id_pedido);
      const idsUsuarios = [...new Set(pedidos.map(p => p.id_usuario).filter(id => id != null))];

      const itensQuery = await PedidoItem.findAll({
        where: { id_pedido: { [Op.in]: idsPedidos } },
        include: [{ model: ProdutoORM, attributes: ['nome'] }],
        raw: true
      });

      let usuariosQuery = [];
      if (idsUsuarios.length > 0) {
        usuariosQuery = await Usuario.findAll({
          where: { id_usuario: { [Op.in]: idsUsuarios } },
          attributes: ['id_usuario', 'nome'],
          raw: true
        });
      }

      const usuariosMap = usuariosQuery.reduce((acc, u) => {
        acc[u.id_usuario] = u.nome;
        return acc;
      }, {});

      let receitaTotal = 0;
      const produtosContagem = {};

      // 3. Processa os cálculos em memória JavaScript
      const itensPorPedido = itensQuery.reduce((acc, item) => {
        if (!acc[item.id_pedido]) acc[item.id_pedido] = [];
        acc[item.id_pedido].push(item);

        const subtotal = Number(item.quantidade) * Number(item.preco_unitario);
        receitaTotal += subtotal;

        // Ajustado para casar com o modelo 'produto' (letra minúscula/maiúscula conforme o Sequelize retorna em raw: true)
        const nomeProduto = item['produto.nome'] || item['Produto.nome'] || 'Produto Excluído';

        if (!produtosContagem[item.id_produto]) {
          produtosContagem[item.id_produto] = { nome: nomeProduto, total: 0 };
        }
        produtosContagem[item.id_produto].total += Number(item.quantidade);

        return acc;
      }, {});

      // 4. Monta a lista Detalhada para a tabela do front e PDF
      const pedidosDetalhados = pedidos.map(p => {
        let valorTotalPedido = 0;
        if (itensPorPedido[p.id_pedido]) {
          valorTotalPedido = itensPorPedido[p.id_pedido].reduce((soma, i) => soma + (Number(i.quantidade) * Number(i.preco_unitario)), 0);
        }
        return {
          id_pedido: p.id_pedido,
          nome_cliente: usuariosMap[p.id_usuario] || 'Cliente não identificado',
          data_pedido: p.data_pedido,
          valor_total: valorTotalPedido
        };
      });

      // 5. Ordena o ranking de vendas para os gráficos
      const maisVendidosArray = Object.values(produtosContagem)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(p => ({ nome: p.nome, total_vendido: p.total }));

      return {
        resumo: {
          total_pedidos: totalPedidos,
          receita_total: receitaTotal
        },
        maisVendidos: maisVendidosArray,
        pedidosDetalhados: pedidosDetalhados.sort((a, b) => new Date(b.data_pedido) - new Date(a.data_pedido))
      };
    } catch (error) {
      console.error("Erro crítico ao buscar dados do dashboard:", error);
      throw error;
    }
  }
};

export default Pedido;