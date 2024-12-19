import { config } from "dotenv";

config();

export const PORT = process.env.PORT;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const REPO_OWNER = process.env.REPO_OWNER;
export const REPO_NAME = process.env.REPO_NAME;

export const DB_HOST = process.env.DB_HOST;  
export const DB_PORT = parseInt(process.env.DB_PORT);
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
