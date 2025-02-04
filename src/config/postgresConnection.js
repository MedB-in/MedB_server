require('dotenv').config();
const { Sequelize } = require('sequelize');
const env = require('../util/validateEnv');

const db = env.POSTGRES_CONNECTION_STRING;

const sequelize = new Sequelize(db, {
    dialect: 'postgres',
    logging: false, // Disable query logging; set to true for debugging
});

const connectPostgreSQL = async (retries = 3) => {
    while (retries) {
        try {
            await sequelize.authenticate();
            console.log('PostgreSQL database connected successfully');
            break;
        } catch (error) {
            retries -= 1;
            console.error(
                `PostgreSQL connection failed. Retrying (${3 - retries}/3)...`,
                error.message
            );
            if (!retries) {
                console.error('All retries failed. Skipping PostgreSQL connection.');
                throw error;
            }
            await new Promise((res) => setTimeout(res, 2000));
        }
    }
};

(async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing database:', error.message);
    }
})();

module.exports = { sequelize, connectPostgreSQL };
