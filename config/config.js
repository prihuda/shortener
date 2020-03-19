require('dotenv').config();//instatiate environment variables
let CONFIG = {} //Make this global to use all over the application
// const { Client } = require('pg');
//
// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true,
// });
// client.connect();

CONFIG.app          = process.env.APP   || 'dev';
CONFIG.port         = process.env.PORT  || '3000';

CONFIG.db_dialect   = process.env.DB_DIALECT || 'postgres'
CONFIG.db_host      = process.env.DB_HOST || 'ec2-18-235-97-230.compute-1.amazonaws.com'
CONFIG.db_port      = process.env.DB_PORT || '5432'
CONFIG.db_name      = process.env.DB_NAME || 'desvceospj82tb'
CONFIG.db_user      = process.env.DB_USER || 'fqqceoqvzmlcae'
CONFIG.db_password  = process.env.DB_PASSWORD || '8163ec8c9780ac1d6ab5a80ba843f7a6aec1f469214e4fb27d8f378cd0dfbcef'

CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '10000';

module.exports = CONFIG;
