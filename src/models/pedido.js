// src/models/pedido.js
const db = require('../config/database');

const Pedido = {
  criarPedidoCompleto: async (idUsuario, itens) => {
    // Pegamos uma conexão exclusiva do pool para controlar a transação
    const connection = await db.getConnection();
    
    try {
      // Inicia a transação. Se algo der errado daqui para frente, nada é salvo no banco
      await connection.beginTransaction();

      // 1. Insere o cabeçalho do pedido
      const queryPedido = 'INSERT INTO pedido (id_usuario) VALUES (?)';
      const [resultPedido] = await connection.execute(queryPedido, [idUsuario]);
      const idPedido = resultPedido.insertId; // Captura o ID do pedido gerado automaticamente

      // 2. Percorre a lista de itens e insere na tabela pedido_item
      const queryItem = `INSERT INTO pedido_item (id_pedido, id_produto, quantidade, preco_unitario) 
                         VALUES (?, ?, ?, ?)`;
      
      for (const item of itens) {
        await connection.execute(queryItem, [
          idPedido, 
          item.id_produto, 
          item.quantidade, 
          item.preco_unitario
        ]);

        // Opcional: Atualiza o estoque do produto decrementando a quantidade comprada
        const queryEstoque = 'UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?';
        await connection.execute(queryEstoque, [item.quantidade, item.id_produto]);
      }

      // Se todas as inserções deram certo, confirma tudo de uma vez no banco
      await connection.commit();
      return idPedido;

    } catch (error) {
      // Se houver qualquer erro (ex: produto sem estoque), desfaz tudo o que foi feito acima
      await connection.rollback();
      throw error;
    } finally {
      // Devolve a conexão de volta para o pool do Docker
      connection.release();
    }
  }
};

module.exports = Pedido;