import { sequelize, Pedido as PedidoORM, PedidoItem, Produto } from '../config/orm.js';
import { QueryTypes } from 'sequelize';

const Pedido = {
  buscarUltimoPedidoItens: async (idUsuario) => {
    const query = `
        SELECT pi.quantidade, pi.preco_unitario, p.nome AS nome_produto 
        FROM pedido_item pi
        JOIN pedido ped ON pi.id_pedido = ped.id_pedido
        JOIN produto p ON pi.id_produto = p.id_produto
        WHERE ped.id_usuario = :idUsuario AND ped.id_pedido = (
            SELECT MAX(id_pedido) FROM pedido WHERE id_usuario = :idUsuario
        )
    `;
    return await sequelize.query(query, {
        replacements: { idUsuario },
        type: QueryTypes.SELECT
    });
  },

  criarPedidoCompleto: async (idUsuario, itens) => {
    // Inicia uma transação do Sequelize
    const transaction = await sequelize.transaction();
    try {
      // 1. Cria o Pedido
      const novoPedido = await PedidoORM.create({ id_usuario: idUsuario }, { transaction });
      
      for (const item of itens) {
        // 2. Cria os itens do pedido
        await PedidoItem.create({
          id_pedido: novoPedido.id_pedido,
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }, { transaction });

        // 3. Subtrai o estoque usando incremento negativo
        await Produto.decrement('estoque', { by: item.quantidade, where: { id_produto: item.id_produto }, transaction });
      }

      await transaction.commit();
      return novoPedido.id_pedido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

<<<<<<< HEAD
  buscarDadosDashboard: async () => {
    // Busca o total de vendas realizadas e o somatório (faturamento)
    const queryResumo = `
=======
  buscarDadosDashboard: async (dataInicio, dataFim) => {
    const params = {};

    // Monta as queries de forma dinâmica
    let queryResumo = `
>>>>>>> 3e1a7a4 (sequelize)
        SELECT 
            COUNT(DISTINCT p.id_pedido) as total_pedidos,
            COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0) as receita_total
        FROM pedido p
        LEFT JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
    `;
    const [resumo] = await db.execute(queryResumo);

    // Busca os 5 produtos com maior número de saída (mais vendidos)
    const queryMaisVendidos = `
        SELECT pr.nome, SUM(pi.quantidade) as total_vendido
        FROM pedido_item pi
        JOIN produto pr ON pi.id_produto = pr.id_produto
<<<<<<< HEAD
        GROUP BY pr.id_produto
        ORDER BY total_vendido DESC
        LIMIT 5
    `;
    const [maisVendidos] = await db.execute(queryMaisVendidos);
=======
        JOIN pedido p ON pi.id_pedido = p.id_pedido
    `;

    // Adiciona a cláusula WHERE se as datas foram fornecidas
    if (dataInicio && dataFim) {
      const whereClause = ' WHERE p.data_pedido BETWEEN :dataInicio AND :dataFim';
      queryResumo += whereClause;
      queryMaisVendidos += whereClause;
      params.dataInicio = dataInicio;
      params.dataFim = `${dataFim} 23:59:59`;
    }

    // Finaliza a query de mais vendidos com agrupamento e ordenação
    queryMaisVendidos += `
        GROUP BY pr.id_produto, pr.nome
        ORDER BY total_vendido DESC
        LIMIT 5
    `;

    const resumo = await sequelize.query(queryResumo, { replacements: params, type: QueryTypes.SELECT });
    const maisVendidos = await sequelize.query(queryMaisVendidos, { replacements: params, type: QueryTypes.SELECT });
>>>>>>> 3e1a7a4 (sequelize)

    return {
        resumo: resumo[0],
        maisVendidos: maisVendidos.map(item => ({ ...item, total_vendido: Number(item.total_vendido) }))
    };
<<<<<<< HEAD
=======
  },

  buscarPedidosPorUsuario: async (idUsuario) => {
    // 1. Busca os dados cruzando as tabelas corretas (pedido, pedido_item, produto)
    const query = `
      SELECT 
          p.id_pedido, 
          p.data_pedido, 
          pi.quantidade, 
          pi.preco_unitario, 
          pr.nome AS nome_produto
      FROM pedido p
      INNER JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
      INNER JOIN produto pr ON pi.id_produto = pr.id_produto
      WHERE p.id_usuario = :idUsuario
      ORDER BY p.data_pedido DESC
    `;
    
    const resultados = await sequelize.query(query, { replacements: { idUsuario }, type: QueryTypes.SELECT });

    // 2. Agrupa os itens e calcula o valor total de cada pedido
    const pedidosAgrupados = {};

    resultados.forEach(linha => {
        if (!pedidosAgrupados[linha.id_pedido]) {
            pedidosAgrupados[linha.id_pedido] = {
                id_pedido: linha.id_pedido,
                data_pedido: linha.data_pedido,
                valor_total: 0,
                itens: [] // Inicia o carrinho do pedido vazio
            };
        }

        // O PostgreSQL pode retornar numeric como string, garantimos com Number()
        pedidosAgrupados[linha.id_pedido].valor_total += (Number(linha.quantidade) * Number(linha.preco_unitario));
        pedidosAgrupados[linha.id_pedido].itens.push({
            nome_produto: linha.nome_produto,
            quantidade: linha.quantidade,
            preco_unitario: linha.preco_unitario
        });
    });

    // 3. Retorna apenas os valores processados na forma de array
    return Object.values(pedidosAgrupados);
  },

  buscarRelatorioDetalhado: async (dataInicio, dataFim) => {
    let query = `
        SELECT 
            p.id_pedido, 
            p.data_pedido, 
            COALESCE(u.nome, 'Cliente não identificado') AS cliente,
            pi.quantidade, 
            pi.preco_unitario, 
            pr.nome AS nome_produto
        FROM pedido p
        LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN pedido_item pi ON p.id_pedido = pi.id_pedido
        INNER JOIN produto pr ON pi.id_produto = pr.id_produto
    `;
    const params = {};
    if (dataInicio && dataFim) {
      query += ' WHERE p.data_pedido BETWEEN :dataInicio AND :dataFim';
      params.dataInicio = dataInicio;
      params.dataFim = `${dataFim} 23:59:59`;
    }
    query += ' ORDER BY p.data_pedido DESC';

    const resultados = await sequelize.query(query, { replacements: params, type: QueryTypes.SELECT });
    const pedidosAgrupados = {};

    resultados.forEach(linha => {
        if (!pedidosAgrupados[linha.id_pedido]) {
            pedidosAgrupados[linha.id_pedido] = { id_pedido: linha.id_pedido, data_pedido: linha.data_pedido, cliente: linha.cliente, valor_total: 0, itens: [] };
        }
        pedidosAgrupados[linha.id_pedido].valor_total += (Number(linha.quantidade) * Number(linha.preco_unitario));
        pedidosAgrupados[linha.id_pedido].itens.push({
            nome_produto: linha.nome_produto, quantidade: linha.quantidade, preco_unitario: linha.preco_unitario
        });
    });

    return Object.values(pedidosAgrupados);
>>>>>>> 3e1a7a4 (sequelize)
  }
};

export default Pedido;