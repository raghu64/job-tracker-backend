import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';


const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
console.log(`Loading environment variables from ${envPath}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(`⚠️  No .env file found for NODE_ENV="${NODE_ENV}" at ${envPath}`);
}

interface Config {
  port: number;
  jwtSecret: string;
  mongoDbUrl: string;
  nodeEnv: string;
  googleApiKey: string;
  googleOAuthClientId: string;
  googleOAuthClientSecret: string;
  googleOAuthRefreshToken: string;
}

function getEnvVar(key: string, required = true): string {
  const val = process.env[key];
  if (required && (val === undefined || val === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val!;
}

const config: Config = {
  port: parseInt(getEnvVar('PORT'), 10),
  jwtSecret: getEnvVar('JWT_SECRET'),
  mongoDbUrl: getEnvVar('MONGO_URI'),
  nodeEnv: NODE_ENV,
  googleApiKey: getEnvVar('GOOGLE_API_KEY'),
  googleOAuthClientId: getEnvVar('GOOGLE_OAUTH_CLIENT_ID'),
  googleOAuthClientSecret: getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET'), 
  googleOAuthRefreshToken: getEnvVar('GOOGLE_OAUTH_REFRESH_TOKEN')
};

export default config;
