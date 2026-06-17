import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Administrador = sequelize.define('Administrador', {
  id_admin: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(50) },
  email: { type: DataTypes.STRING(50), unique: true },
  senha: { type: DataTypes.STRING(50) }
}, {
  tableName: 'administrador',
  timestamps: false
});

export default Administrador;