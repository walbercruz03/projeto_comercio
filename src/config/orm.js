import { Sequelize, DataTypes } from 'sequelize';

// Inicializa a conexão com o PostgreSQL usando as variáveis do seu .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', // Mudado de mysql para postgres!
    logging: false,      //Desativa logs de SQL no terminal (opcional)
    define: {
      freezeTableName: true, // Garante que o Sequelize não mude o nome das tabelas para o plural
      timestamps: false      // Desativa as colunas createdAt e updatedAt (já que seu init.sql não tem)
    }
  }
);

// --- MAPEAMENTO DOS MODELOS (Exatamente como estão no seu init.sql) ---

const Usuario = sequelize.define('usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: DataTypes.STRING(50),
  cpf: DataTypes.STRING(50),
  data_nascimento: DataTypes.DATEONLY,
  email: DataTypes.STRING(50),
  telefone: DataTypes.STRING(50),
  senha: DataTypes.STRING(50)
});

const Administrador = sequelize.define('administrador', {
  id_admin: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: DataTypes.STRING(50),
  email: { type: DataTypes.STRING(50), unique: true },
  senha: DataTypes.STRING(50)
});

const Produto = sequelize.define('produto', {
  id_produto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: DataTypes.STRING(100),
  descricao: DataTypes.TEXT,
  preco: DataTypes.DECIMAL(10, 2),
  estoque: DataTypes.INTEGER,
  imagem: DataTypes.STRING(255),
  categoria: { type: DataTypes.STRING(50), defaultValue: 'Geral' }
});

const Pedido = sequelize.define('pedido', {
  id_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  data_pedido: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

const PedidoItem = sequelize.define('pedido_item', {
  id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: DataTypes.INTEGER,
  id_produto: DataTypes.INTEGER,
  quantidade: DataTypes.INTEGER,
  preco_unitario: DataTypes.DECIMAL(10, 2)
});

// --- DEFINIÇÃO DOS RELACIONAMENTOS (Associações) ---
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Pedido.hasMany(PedidoItem, { foreignKey: 'id_pedido' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'id_pedido' });
PedidoItem.belongsTo(Produto, { foreignKey: 'id_produto' });

export { sequelize, Usuario, Administrador, Produto, Pedido, PedidoItem };
export default sequelize;