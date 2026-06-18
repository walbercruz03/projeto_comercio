import Produto from '../models/produto.js';

export const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.listarTodos();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produtos." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.buscarPorId(id);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar detalhes do produto." });
  }
};

export const cadastrarProduto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: "A imagem do produto é obrigatória." });
    
    const nomeImagem = req.file.filename; 
    await Produto.cadastrar(req.body, nomeImagem);
    res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", imagem: nomeImagem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao salvar produto." });
  }
};

export const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const nomeImagem = req.file ? req.file.filename : null;

    await Produto.atualizar(id, req.body, nomeImagem);
    res.json({ mensagem: "Produto updated com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar produto." });
  }
};

export const excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Produto.excluir(id);
    
    if (result.affectedRows === 0) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json({ mensagem: "Produto excluído com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao tentar excluir o produto." });
  }
};