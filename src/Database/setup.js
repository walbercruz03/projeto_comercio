import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    // Abre a conexão com o banco SQLite
    const db = await openDb();
    // Aponta para o seu script init_sqlite.sql na raiz do projeto
    const sqlFilePath = path.join(__dirname, '../../init_sqlite.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executa todo o script SQL de uma vez
    await db.exec(sql);
    console.log("✅ Tabelas criadas e dados inseridos com sucesso no SQLite!");
  } catch (error) {
    console.error("❌ Erro ao inicializar o banco de dados:", error);
  }
}

setupDatabase();