const { cleanEnv } = require('envalid');
const { port, str } = require('envalid/dist/validators');

module.exports = cleanEnv(process.env, {
  NODE_ENV: str(),

  PORT: port(),

  DEV_URL: str(),
  TEST_URL: str(),
  PRODUCTION_URL: str(),

  MONGO_CONNECTION_STRING: str(),
  POSTGRES_CONNECTION_STRING: str(),

  COOKIE_SECRET: str(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),

  ACCESS_TOKEN_LIFE: str(),
  REFRESH_TOKEN_LIFE: str(),

  NUMBER_OF_PROXIES: str(),

  ERROR_LOG_EXPIRATION: str(),

  EMAIL: str(),
  EMAILPASS: str(),
});
