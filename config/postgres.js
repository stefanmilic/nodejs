const { Client } = require("pg");
const config = require("./database");
module.exports = new Client({
  connectionString: config.postgresUrl
});
