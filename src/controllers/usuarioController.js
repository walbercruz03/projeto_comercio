// src/controllers/usuarioController.js
const Usuario = require('../models/usuario');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios!" });
    }

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos!" });
    }

    res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

exports.cadastro = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, email, telefone, senha } = req.body;

    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado!" });
    }

    await Usuario.cadastrar({ nome, cpf, dataNascimento, email, telefone, senha });
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
};