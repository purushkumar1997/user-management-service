import * as dotenv from 'dotenv';
dotenv.config();
export const Constants = {
  db_host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db_username: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  jwt: 'JWT',
};
