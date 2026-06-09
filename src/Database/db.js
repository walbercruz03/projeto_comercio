import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração para abrir ou criar o banco de dados SQLite
export async function openDb() {
  return open({
    // O arquivo database.sqlite será criado automaticamente nesta pasta
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });
}