const mysql = require('mysql2');

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'DITProject',
    },
  });
module.exports = knex;