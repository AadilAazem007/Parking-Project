import dotenv from 'dotenv';

dotenv.config();

console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'indianic',
      database: process.env.DB_NAME || 'digiparking_db'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};