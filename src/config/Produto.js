import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Produto = sequelize.define('Produto', {
  id_produto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100) },
  descricao: { type: DataTypes.TEXT },
  preco: { type: DataTypes.DECIMAL(10, 2) },
  estoque: { type: DataTypes.INTEGER },
  imagem: { type: DataTypes.STRING(255), allowNull: true },
  categoria: { type: DataTypes.STRING(50), defaultValue: 'Geral' }
}, {
  tableName: 'produto',
  timestamps: false
});

export default Produto;