import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const PedidoItem = sequelize.define('PedidoItem', {
  id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER },
  id_produto: { type: DataTypes.INTEGER },
  quantidade: { type: DataTypes.INTEGER },
  preco_unitario: { type: DataTypes.DECIMAL(10, 2) }
}, {
  tableName: 'pedido_item',
  timestamps: false
});

export default PedidoItem;