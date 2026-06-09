import mysqlDb from '../config/database.js';
import { openDb } from '../Database/db.js';

// Verifica se o projeto está configurado para usar SQLite no .env
// Caso não exista essa variável, o padrão será sempre usar o MySQL
const useSQLite = process.env.DB_TYPE === 'sqlite';

const Produto = {
  listarTodos: async () => {
    if (useSQLite) {
      const db = await openDb();
      return await db.all('SELECT * FROM produto');
    } else {
      const [rows] = await mysqlDb.execute('SELECT * FROM produto');
      return rows;
    }
  },

  buscarPorId: async (id) => {
    if (useSQLite) {
      const db = await openDb();
      return await db.get('SELECT * FROM produto WHERE id_produto = ?', [id]);
    } else {
      const [rows] = await mysqlDb.execute('SELECT * FROM produto WHERE id_produto = ?', [id]);
      return rows[0];
    }
  },

  cadastrar: async (dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    const query = 'INSERT INTO produto (nome, preco, estoque, descricao, imagem) VALUES (?, ?, ?, ?, ?)';
    
    if (useSQLite) {
      const db = await openDb();
      return await db.run(query, [nome, preco, estoque, descricao, nomeImagem]);
    } else {
      const [result] = await mysqlDb.execute(query, [nome, preco, estoque, descricao, nomeImagem]);
      return result;
    }
  },

  atualizar: async (id, dados, nomeImagem) => {
    if (nomeImagem) {
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ?, imagem = ? 
                     WHERE id_produto = ?`;
      if (useSQLite) {
        const db = await openDb();
        return await db.run(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, nomeImagem, id]);
      } else {
        return await mysqlDb.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, nomeImagem, id]);
      }
    } else {
      const query = `UPDATE produto SET nome = ?, preco = ?, estoque = ?, descricao = ? 
                     WHERE id_produto = ?`;
      if (useSQLite) {
        const db = await openDb();
        return await db.run(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, id]);
      } else {
        return await mysqlDb.execute(query, [dados.nome, dados.preco, dados.estoque, dados.descricao, id]);
      }
    }
  },

  excluir: async (id) => {
    if (useSQLite) {
      const db = await openDb();
      return await db.run('DELETE FROM produto WHERE id_produto = ?', [id]);
    } else {
      const [result] = await mysqlDb.execute('DELETE FROM produto WHERE id_produto = ?', [id]);
      return result;
    }
  }
};

export default Produto;