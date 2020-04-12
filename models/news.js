const { DataTypes } = require("sequelize");
const db = require("../db");

const News = db.define("news", {
    key: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    items: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("items"));
        },
        set: function (items) {
            return this.setDataValue("items", JSON.stringify(items));
        },
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    link: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    source: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

News.sync({
    alter: true
}).then(() => {
    console.log("Table created");
}).catch(err => {
    console.log(err);
});

module.exports = News;
