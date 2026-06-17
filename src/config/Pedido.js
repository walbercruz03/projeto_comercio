import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Pedido = sequelize.define('Pedido', {
  id_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  data_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'pedido',
  timestamps: false
});

export default Pedido;