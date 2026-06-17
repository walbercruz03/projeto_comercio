import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Trava de segurança: Se o host for 'db' (padrão Docker), força para localhost
const dbHost = process.env.DB_HOST === 'db' ? '127.0.0.1' : (process.env.DB_HOST || 'localhost');

// Cria a instância do Sequelize com as variáveis de ambiente
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: dbHost,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log, // Mostra no terminal todas as queries SQL que o Sequelize executa
        dialectOptions: process.env.NODE_ENV === 'production' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    }
);

export default sequelize;