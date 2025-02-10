require('dotenv').config();
const env = require('../utils/validateEnv');
const mongoose = require('mongoose');

const db = env.MONGO_CONNECTION_STRING;

module.exports = async function () {
    mongoose.set("strictQuery", true);
    await mongoose.connect(db)
        .then(() => {
            console.log("MongoDB database connected successfully");
        })
        .catch((error) => {
            console.error("MongoDB database connection failed:", error);
        });
};
