// src/models/usuario.js
import db from '../config/database.js';

const Usuario = {
  buscarPorEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0]; 
  },

  cadastrar: async (dados) => {
    const { nome, cpf, dataNascimento, email, telefone, senha } = dados;
    const query = `INSERT INTO usuario (nome, cpf, data_nascimento, email, telefone, senha) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(query, [nome, cpf, dataNascimento, email, telefone, senha]);
    return result;
  },

  listarAdmins: async () => {
    const [rows] = await db.execute('SELECT id_usuario, nome, email, tipo_usuario FROM usuario WHERE tipo_usuario IN ("admin", "admin_principal")');
    return rows;
  },

  cadastrarAdmin: async (dados) => {
    const { nome, email, senha } = dados;
    const query = `INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, 'admin')`;
    const [result] = await db.execute(query, [nome, email, senha]);
    return result;
  },

  atualizarAdmin: async (id, dados) => {
    const { nome, email, senha } = dados;
    if (senha && senha.trim() !== '') {
      const query = `UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id_usuario = ?`;
      return await db.execute(query, [nome, email, senha, id]);
    } else {
      const query = `UPDATE usuario SET nome = ?, email = ? WHERE id_usuario = ?`;
      return await db.execute(query, [nome, email, id]);
    }
  },

  excluirAdmin: async (id) => {
    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
  }
};

export default Usuario;