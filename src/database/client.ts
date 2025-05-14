import 'dotenv/config';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('Faltando credenciais do banco de dados');
}

export const sql = postgres(process.env.DATABASE_URL);
