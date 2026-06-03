import db from '../config/database.js';

const Pedido = {
  buscarUltimoPedidoItens: async (idUsuario) => {
    const query = `
        SELECT pi.quantidade, pi.preco_unitario, p.nome AS nome_produto 
        FROM pedido_item pi
        JOIN pedido ped ON pi.id_pedido = ped.id_pedido
        JOIN produto p ON pi.id_produto = p.id_produto
        WHERE ped.id_usuario = ? AND ped.id_pedido = (
            SELECT MAX(id_pedido) FROM pedido WHERE id_usuario = ?
        )
    `;
    const [rows] = await db.execute(query, [idUsuario, idUsuario]);
    return rows;
  },

  criarPedidoCompleto: async (idUsuario, itens) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const queryPedido = 'INSERT INTO pedido (id_usuario) VALUES (?)';
      const [resultPedido] = await connection.execute(queryPedido, [idUsuario]);
      const idPedido = resultPedido.insertId;

      const queryItem = `INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) 
                         VALUES (?, ?, ?, ?)`;
      
      for (const item of itens) {
        await connection.execute(queryItem, [idPedido, item.id_produto, item.quantidade, item.preco_unitario]);

        const queryEstoque = 'UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?';
        await connection.execute(queryEstoque, [item.quantidade, item.id_produto]);
      }

      await connection.commit();
      return idPedido;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  buscarDadosDashboard: async () => {
    // Busca o total de vendas realizadas e o somatório (faturamento)
    const queryResumo = `
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
        GROUP BY pr.id_produto
        ORDER BY total_vendido DESC
        LIMIT 5
    `;
    const [maisVendidos] = await db.execute(queryMaisVendidos);

    return {
        resumo: resumo[0],
        maisVendidos
    };
  }
};

export default Pedido;