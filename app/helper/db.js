const mysql = require("mysql");
const logger = require('./logger');
const database = () => {
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    db.connect(err => {
        if (err) {
            logger.error(`Database connection failed: ${err.stack}`);
            return;
        }
        logger.info('Connected to the database');
    });
};

module.exports = { database };

