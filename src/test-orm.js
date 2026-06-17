import { sequelize, Produto, Pedido, Usuario, PedidoItem } from './config/orm.js';

/**
 * Este script serve para testar se os modelos e associações do Sequelize
 * estão funcionando corretamente. Ele não faz parte da aplicação principal.
 */
async function testarModelosORM() {
  try {
    // 1. Teste de conexão inicial
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!\n');

    // 1.5. Garante que todas as tabelas existam (equivalente a rodar o init.sql)
    await sequelize.sync({ alter: false });
    console.log('✅ Tabelas criadas/sincronizadas com sucesso!\n');

    // 2. Teste simples: Listar todos os produtos
    console.log('Buscando todos os produtos...');
    const produtos = await Produto.findAll();
    
    // O resultado do Sequelize é um array de instâncias, usamos .toJSON() para ver o objeto puro
    console.log('✅ Produtos encontrados:', JSON.stringify(produtos, null, 2));

    // 3. Teste de associação: Buscar um pedido com seus itens e o nome do produto associado
    console.log('\nBuscando o primeiro pedido com seus itens e usuário...');
    const primeiroPedido = await Pedido.findOne({
      // O 'include' é a principal ferramenta para JOINs no Sequelize
      include: [
        {
          model: Usuario, // Inclui os dados do usuário que fez o pedido
          attributes: ['nome', 'email'] // Pega apenas o nome e email do usuário
        },
        {
          model: PedidoItem,
          as: 'itens', // O 'as' que definimos no orm.js
          include: {
            model: Produto, // Dentro de cada item, inclui os dados do produto
            attributes: ['nome'] // Pega apenas o nome do produto
          }
        }
      ]
    });

    if (primeiroPedido) {
        console.log('✅ Pedido com associações encontrado:', JSON.stringify(primeiroPedido, null, 2));
    } else {
        console.log('ℹ️ Nenhum pedido encontrado no banco para testar as associações.');
    }

  } catch (error) {
    console.error('❌ Erro ao testar os modelos do ORM:', error);
  } finally {
    // É importante fechar a conexão para o script terminar
    await sequelize.close();
  }
}

testarModelosORM();