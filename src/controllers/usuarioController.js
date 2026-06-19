import { Usuario, Administrador } from '../config/orm.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_123';

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios!" });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: false,  
      maxAge: 24 * 60 * 60 * 1000 
    };

    // 1º Passo: Admin Principal (Alterado payload para id: 0)
    if (email === "admin@gmail.com" && senha === "admin123") {
      const payload = { id: 0, nome: "Administrador Principal", email, tipo_usuario: "admin_principal" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, cookieOptions);
      return res.json({ mensagem: "Login realizado com sucesso!", usuario: payload });
    }

    // 2º Passo: Administradores (Alterado para id: admin.id_admin)
    const admin = await Administrador.findOne({ where: { email } });
    if (admin && admin.senha === senha) {
      const payload = { id: admin.id_admin, nome: admin.nome, email: admin.email, tipo_usuario: "admin" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, cookieOptions);
      return res.json({ mensagem: "Login realizado com sucesso!", usuario: payload });
    }

    // 3º Passo: Clientes normais (Alterado para id: usuario.id_usuario)
    const usuario = await Usuario.findOne({ where: { email } });
    if (usuario && usuario.senha === senha) {
      const payload = { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, tipo_usuario: "cliente" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, cookieOptions);
      return res.json({ mensagem: "Login realizado com sucesso!", usuario: payload });
    }

    return res.status(401).json({ erro: "E-mail ou senha incorretos!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

// ... os demais métodos de cadastro/exclusão continuam abaixo perfeitamente iguais ...


export const cadastro = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, email, telefone, senha } = req.body;
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) return res.status(400).json({ erro: "Este e-mail já está cadastrado!" });

    await Usuario.create({ nome, cpf, data_nascimento: dataNascimento, email, telefone, senha });
    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
};

// ... seu método login, cadastro, etc. continuam iguais ...

export const listarAdmins = async (req, res) => {
  try {
    // PROTEÇÃO: Verifica se quem está requisitando é o admin principal
    if (!req.usuario || req.usuario.tipo_usuario !== 'admin_principal') {
      return res.status(403).json({ erro: "Acesso negado. Apenas o Administrador Principal pode gerenciar admins." });
    }

    const admins = await Administrador.findAll();
    res.json(admins.map(admin => ({
      id_usuario: admin.id_admin,
      nome: admin.nome,
      email: admin.email,
      tipo_usuario: 'admin'
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar administradores." });
  }
};

export const cadastrarAdmin = async (req, res) => {
  try {
    // PROTEÇÃO: Apenas admin_principal pode cadastrar
    if (!req.usuario || req.usuario.tipo_usuario !== 'admin_principal') {
      return res.status(403).json({ erro: "Acesso negado. Operação não permitida." });
    }

    const { nome, email, senha } = req.body;
    const existe = await Administrador.findOne({ where: { email } });
    if (existe) return res.status(400).json({ erro: "Já existe um usuário cadastrado com este e-mail." });

    await Administrador.create({ nome, email, senha });
    res.status(201).json({ mensagem: "Administrador criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar administrador." });
  }
};

export const atualizarAdmin = async (req, res) => {
  try {
    // PROTEÇÃO: Apenas admin_principal pode atualizar
    if (!req.usuario || req.usuario.tipo_usuario !== 'admin_principal') {
      return res.status(403).json({ erro: "Acesso negado. Operação não permitida." });
    }

    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const dadosAtualizar = senha ? { nome, email, senha } : { nome, email };

    await Administrador.update(dadosAtualizar, { where: { id_admin: id } });
    res.json({ candy: "Administrador updated com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar administrador." });
  }
};

export const excluirAdmin = async (req, res) => {
  try {
    // PROTEÇÃO: Apenas admin_principal pode excluir
    if (!req.usuario || req.usuario.tipo_usuario !== 'admin_principal') {
      return res.status(403).json({ erro: "Acesso negado. Operação não permitida." });
    }

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
    if (!email || !cpf || !novaSenha) return res.status(400).json({ erro: "Todos os campos são obrigatórios." });

    const usuario = await Usuario.findOne({ where: { email, cpf } });
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

    await Usuario.update({ senha: novaSenha }, { where: { id_usuario: usuario.id_usuario } });
    res.status(200).json({ mensagem: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno do servidor ao tentar recuperar a senha." });
  }
};