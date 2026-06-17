import { Produto as ProdutoORM } from '../config/orm.js';

const Produto = {
  listarTodos: async () => {
    // Retorna todos os produtos direto do Sequelize (raw: true garante um objeto simples JSON)
    return await ProdutoORM.findAll({ raw: true });
  },

  buscarPorId: async (id) => {
    return await ProdutoORM.findByPk(id, { raw: true });
  },

  cadastrar: async (dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    
    const novoProduto = await ProdutoORM.create({
      nome,
      preco,
      estoque,
      descricao,
      imagem: nomeImagem || null
    });

    // Simula o retorno 'insertId' do mysql2 para o Controller continuar funcionando intacto
    return { insertId: novoProduto.id_produto };
  },

  atualizar: async (id, dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    const camposAtualizados = { nome, preco, estoque, descricao };
    if (nomeImagem) camposAtualizados.imagem = nomeImagem;

    const [linhasAfetadas] = await ProdutoORM.update(camposAtualizados, { where: { id_produto: id } });
    return { affectedRows: linhasAfetadas };
  },

  excluir: async (id) => {
    const linhasAfetadas = await ProdutoORM.destroy({ where: { id_produto: id } });
    return { affectedRows: linhasAfetadas };
  }
};

export default Produto;