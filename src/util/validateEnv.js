const { cleanEnv } = require('envalid');
const { port, str } = require('envalid/dist/validators');

module.exports = cleanEnv(process.env, {
  MONGO_CONNECTION_STRING: str(),
  POSTGRES_CONNECTION_STRING: str(),
  PORT: port(),
  ACCESS_TOKEN_SECRET: str(),
  ACCESS_TOKEN_LIFE: str(),
  COOKIE_SECRET: str(),
  NODE_ENV: str(),
  DEV_URL: str(),
  TEST_URL: str(),
  PRODUCTION_URL: str(),
  NUMBER_OF_PROXIES: str(),
});
