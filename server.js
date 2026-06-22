import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './src/routes/usuarioRoutes.js'; 
import produtoRoutes from './src/routes/produtoRoutes.js';
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import sequelize from './src/config/orm.js'; 
import viewRoutes from './src/routes/viewRoutes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Configuração do EJS como Template Engine (Páginas Dinâmicas MVC)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ⚠️ CORREÇÃO DE CAMINHO (OpenSpec): Aponta para a pasta public na RAIZ do projeto
app.use(express.static(path.join(__dirname, 'src', 'public'))); 

// 🆕 ADICIONADO: Expõe a pasta de uploads diretamente para que as imagens da logo e produtos abram no navegador
app.use('/uploads', express.static(path.join(__dirname, 'src', 'public', 'uploads')));

// Rotas da API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Rotas Visuais (Páginas MVC dinâmicas EJS)
app.use('/', viewRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Tabelas sincronizadas com o banco de dados PostgreSQL.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Não foi possível conectar ou sincronizar com o banco de dados:', error);
  }
};

startServer();