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
  }
};

export default Usuario;