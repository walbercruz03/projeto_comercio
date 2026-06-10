// src/models/usuario.js
import db from '../config/database.js';

const Usuario = {
  buscarPorEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0]; 
  },

  buscarAdminPorEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM administrador WHERE email = ?', [email]);
    return rows[0]; 
  },

  cadastrar: async (dados) => {
    const { nome, cpf, dataNascimento, email, telefone, senha } = dados;
    const query = `INSERT INTO usuario (nome, cpf, data_nascimento, email, telefone, senha) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [nome, cpf, dataNascimento, email, telefone, senha]);
    return result;
  },

  buscarPorEmailECPF: async (email, cpf) => {
    const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ? AND cpf = ?', [email, cpf]);
    return rows[0];
  },

  atualizarSenha: async (id, novaSenha) => {
    const query = 'UPDATE usuario SET senha = ? WHERE id_usuario = ?';
    return await db.execute(query, [novaSenha, id]);
  },

  listarAdmins: async () => {
    const [rows] = await db.execute('SELECT id_admin as id_usuario, nome, email, "admin" as tipo_usuario FROM administrador');
    return rows;
  },

  cadastrarAdmin: async (dados) => {
    const { nome, email, senha } = dados;
    const query = `INSERT INTO administrador (nome, email, senha) VALUES (?, ?, ?)`;
    const [result] = await db.execute(query, [nome, email, senha]);
    return result;
  },

  atualizarAdmin: async (id, dados) => {
    const { nome, email, senha } = dados;
    if (senha && senha.trim() !== '') {
      const query = `UPDATE administrador SET nome = ?, email = ?, senha = ? WHERE id_admin = ?`;
      return await db.execute(query, [nome, email, senha, id]);
    } else {
      const query = `UPDATE administrador SET nome = ?, email = ? WHERE id_admin = ?`;
      return await db.execute(query, [nome, email, id]);
    }
  },

  excluirAdmin: async (id) => {
    const query = `DELETE FROM administrador WHERE id_admin = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

export default Usuario;