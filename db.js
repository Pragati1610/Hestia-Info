const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: "postgres",
    query: { raw: true }
});

module.exports = sequelize;
