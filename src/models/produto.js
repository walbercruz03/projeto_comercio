// src/models/produto.js
const db = require('../config/database');

const Produto = {
  // 1. Lista todos os produtos do banco
  listarTodos: async () => {
    const [rows] = await db.execute('SELECT * FROM produto');
    return rows;
  },

  // 2. Busca um produto específico pelo ID (usado no checkout e na edição do Admin)
  buscarPorId: async (id) => {
    const [rows] = await db.execute('SELECT * FROM produto WHERE id_produto = ?', [id]);
    return rows[0]; // Retorna apenas o produto encontrado
  }, // <--- Essa vírgula aqui é obrigatória para separar as funções!

  // 3. Atualiza os dados do produto no banco
  atualizar: async (id, dados, nomeImagem) => {
    // Se o admin enviou uma nova imagem, atualizamos ela também
    if (nomeImagem) {
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ?, imagem = ? 
                     WHERE id_produto = ?`;
      return await db.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, nomeImagem, id]);
    } else {
      // Se não enviou imagem, mantém a foto antiga e atualiza só os textos
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ? 
                     WHERE id_produto = ?`;
      return await db.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, id]);
    }
  }
}; // <--- Fecha o objeto Produto corretamente aqui

module.exports = Produto;