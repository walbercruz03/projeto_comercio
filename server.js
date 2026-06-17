// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import usuarioRoutes from './src/routes/usuarioRoutes.js'; // Entra em src/
import produtoRoutes from './src/routes/produtoRoutes.js';
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import sequelize from './src/config/sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aponta para a pasta public dentro de src
app.use(express.static(path.join(__dirname, 'src', 'public'))); 

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use ('/api/produtos', produtoRoutes);
app.use ('/api/pedidos', pedidoRoutes);

const PORT = process.env.PORT || 3000;

// Função para iniciar o servidor após sincronizar com o banco
const startServer = async () => {
  try {
    // Sincroniza os modelos com o banco de dados, criando as tabelas se não existirem
    await sequelize.sync({ alter: false });
    console.log('✅ Tabelas sincronizadas com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Não foi possível conectar ou sincronizar com o banco de dados:', error);
  }
};

startServer();