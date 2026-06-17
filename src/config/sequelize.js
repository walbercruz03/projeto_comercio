import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Trava de segurança: Se o host for 'db' (padrão Docker), força para localhost
const dbHost = process.env.DB_HOST === 'db' ? '127.0.0.1' : (process.env.DB_HOST || 'localhost');

// Verifica se o ambiente é de produção (Render) ou desenvolvimento (Local)
const isProduction = process.env.NODE_ENV === 'production';

// Cria a instância do Sequelize com as variáveis de ambiente
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: dbHost,
        port: process.env.DB_PORT || (isProduction ? 5432 : 3306),
        dialect: isProduction ? 'postgres' : 'mysql',
        logging: isProduction ? false : console.log, // Mostra no terminal todas as queries apenas localmente
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {} // MySQL local não precisa de SSL
    }
);

export default sequelize;