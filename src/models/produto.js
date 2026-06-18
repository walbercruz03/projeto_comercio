import { Produto as ProdutoORM } from '../config/orm.js';

const Produto = {
  listarTodos: async () => {
    return await ProdutoORM.findAll({ raw: true });
  },

  buscarPorId: async (id) => {
    return await ProdutoORM.findByPk(id, { raw: true });
  },

  cadastrar: async (dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    
    const novoProduto = await ProdutoORM.create({
      nome,
      preco: Number(preco),
      estoque: parseInt(estoque, 10),
      descricao,
      imagem: nomeImagem || null
    });

    return { insertId: novoProduto.id_produto };
  },

  atualizar: async (id, dados, nomeImagem) => {
    const { nome, preco, estoque, descricao } = dados;
    const camposAtualizados = {};
    
    if (nome) camposAtualizados.nome = nome;
    if (preco) camposAtualizados.preco = Number(preco);
    if (estoque) camposAtualizados.estoque = parseInt(estoque, 10);
    if (descricao) camposAtualizados.descricao = descricao;
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