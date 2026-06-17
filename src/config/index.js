import sequelize from './sequelize.js';
import Usuario from './Usuario.js';
import Administrador from './Administrador.js';
import Produto from './Produto.js';
import Pedido from './Pedido.js';
import PedidoItem from './PedidoItem.js';

// === Definindo os Relacionamentos (Associações) ===

// Um Usuário tem muitos Pedidos / Um Pedido pertence a um Usuário
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Um Pedido tem muitos Itens / Um Item pertence a um Pedido
Pedido.hasMany(PedidoItem, { foreignKey: 'id_pedido', as: 'itens' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'id_pedido' });

// Um Produto tem muitos Itens de Pedido / Um Item pertence a um Produto
Produto.hasMany(PedidoItem, { foreignKey: 'id_produto' });
PedidoItem.belongsTo(Produto, { foreignKey: 'id_produto' });

// Exportando o banco e as entidades centralizadas
export {
  sequelize,
  Usuario,
  Administrador,
  Produto,
  Pedido,
  PedidoItem
};