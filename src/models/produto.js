import db from '../config/database.js';

const Produto = {
  listarTodos: async () => {
    const [rows] = await db.execute('SELECT * FROM produto');
    return rows;
  },

  buscarPorId: async (id) => {
    const [rows] = await db.execute('SELECT * FROM produto WHERE id_produto = ?', [id]);
    return rows[0];
  },

  cadastrar: async (dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    const query = 'INSERT INTO produto (nome, preco, estoque, descricao, imagem) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [nome, preco, estoque, descricao, nomeImagem]);
    return result;
  },

  atualizar: async (id, dados, nomeImagem) => {
    if (nomeImagem) {
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ?, imagem = ? 
                     WHERE id_produto = ?`;
      return await db.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, nomeImagem, id]);
    } else {
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ? 
                     WHERE id_produto = ?`;
      return await db.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, id]);
    }
  },

  excluir: async (id) => {
    const [result] = await db.execute('DELETE FROM produto WHERE id_produto = ?', [id]);
    return result;
  }
};

export default Produto;