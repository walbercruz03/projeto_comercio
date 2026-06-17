// src/controllers/usuarioController.js
import { Usuario, Administrador } from '../config/orm.js';

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios!" });
    }

    // 1º Passo: Verifica se é o Admin Principal (Hardcoded / Chave Mestra)
    if (email === "admin@gmail.com" && senha === "admin123") {
      return res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: { id_usuario: 0, nome: "Administrador Principal", email: email, tipo_usuario: "admin_principal" }
      });
    }

    // 2º Passo: Busca na tabela exclusiva de Administradores
    const admin = await Administrador.findOne({ where: { email } });
    if (admin && admin.senha === senha) {
      return res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: { id_usuario: admin.id_admin, nome: admin.nome, email: admin.email, tipo_usuario: "admin" }
      });
    }

    // 3º Passo: Busca na tabela comum de Clientes (usuario)
    const usuario = await Usuario.findOne({ where: { email } });
    if (usuario && usuario.senha === senha) {
      return res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, tipo_usuario: "cliente" }
      });
    }

    // Se não encontrou em nenhum lugar
    return res.status(401).json({ erro: "E-mail ou senha incorretos!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

export const cadastro = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, email, telefone, senha } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado!" });
    }

    // O Sequelize vai mapear o camelCase para o padrão snake_case da tabela automaticamente
    await Usuario.create({ nome, cpf, data_nascimento: dataNascimento, email, telefone, senha });
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
};

export const listarAdmins = async (req, res) => {
  try {
    const admins = await Administrador.findAll();
    
    // Formata o retorno para o padrão que o front-end (gerenciar_admins.js) espera
    const adminsFormatado = admins.map(admin => ({
      id_usuario: admin.id_admin,
      nome: admin.nome,
      email: admin.email,
      tipo_usuario: 'admin'
    }));
    
    res.json(adminsFormatado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar administradores." });
  }
};

export const cadastrarAdmin = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await Administrador.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Já existe um usuário cadastrado com este e-mail." });
    }

    await Administrador.create({ nome, email, senha });
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

    // Se não enviou senha nova (vazia), atualiza só nome e email para não sobrescrever
    const dadosAtualizar = senha ? { nome, email, senha } : { nome, email };

    await Administrador.update(dadosAtualizar, { where: { id_admin: id } });
    res.json({ mensagem: "Administrador atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar administrador." });
  }
};

export const excluirAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Administrador.destroy({ where: { id_admin: id } });
    res.json({ mensagem: "Administrador removido com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir administrador." });
  }
};

export const recuperarSenha = async (req, res) => {
  try {
    const { email, cpf, novaSenha } = req.body;

    if (!email || !cpf || !novaSenha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    // Busca o usuário na tabela de clientes (usuario)
    const usuario = await Usuario.findOne({ where: { email, cpf } });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado. Verifique o e-mail e o CPF informados." });
    }

    await Usuario.update({ senha: novaSenha }, { where: { id_usuario: usuario.id_usuario } });
    res.status(200).json({ mensagem: "Senha atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao recuperar senha:", error);
    res.status(500).json({ erro: "Erro interno do servidor ao tentar recuperar a senha." });
  }
};