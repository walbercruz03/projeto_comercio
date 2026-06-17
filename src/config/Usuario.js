import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(50) },
  cpf: { type: DataTypes.STRING(50) },
  data_nascimento: { type: DataTypes.DATEONLY }, // DATE no MySQL vira DATEONLY no Sequelize
  email: { type: DataTypes.STRING(50) },
  telefone: { type: DataTypes.STRING(50) },
  senha: { type: DataTypes.STRING(50) }
}, {
  tableName: 'usuario',
  timestamps: false // O init.sql original não possui as colunas 'createdAt' e 'updatedAt'
});

export default Usuario;