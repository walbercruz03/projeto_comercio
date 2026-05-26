// src/controllers/produtoController.js
const Produto = require('../models/produto');

exports.listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.listarTodos();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produtos." });
  }
};

// NOVA: Busca o produto por ID para carregar no formulário do Admin
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.buscarPorId(id);
    
    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }
    
    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar detalhes do produto." });
  }
};

// NOVA: Processa os dados editados e salva no banco
exports.atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const nomeImagem = req.file ? req.file.filename : null; // Verifica se subiu nova foto

    await Produto.atualizar(id, req.body, nomeImagem);
    res.json({ mensagem: "Produto atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar produto." });
  }
};

//Deleta o produto do banco de dados
exports.excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Conecta direto ao banco para rodar o comando de exclusão
    const db = require('../config/database');
    
    // Deleta o produto usando o ID correspondente
    const [result] = await db.execute('DELETE FROM produto WHERE id_produto = ?', [id]);
    
    // Verifica se algum registro de fato foi afetado/excluído no MySQL
    if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Produto não encontrado para exclusão." });
    }
    
    res.json({ mensagem: "Produto excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ erro: "Erro interno ao tentar excluir o produto." });
  }
};