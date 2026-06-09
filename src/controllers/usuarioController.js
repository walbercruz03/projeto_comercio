// src/controllers/usuarioController.js
import Usuario from '../models/usuario.js';

export const login = async (req, res) => {
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

export const cadastro = async (req, res) => {
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

export const listarAdmins = async (req, res) => {
  try {
    const admins = await Usuario.listarAdmins();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar administradores." });
  }
};

export const cadastrarAdmin = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Já existe um usuário cadastrado com este e-mail." });
    }

    await Usuario.cadastrarAdmin({ nome, email, senha });
    res.status(201).json({ mensagem: "Administrador criado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar administrador." });
  }
};

export const atualizarAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    await Usuario.atualizarAdmin(id, { nome, email, senha });
    res.json({ mensagem: "Administrador atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar administrador." });
  }
};

export const excluirAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.excluirAdmin(id);
    res.json({ mensagem: "Administrador removido com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir administrador." });
  }
};