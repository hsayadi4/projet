// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('myshop', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
