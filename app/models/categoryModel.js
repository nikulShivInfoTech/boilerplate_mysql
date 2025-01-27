const { db } = require('./userTableModel');

const ensureOtpTableExists = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL
);`;

  return new Promise((resolve, reject) => {
    db.query(createTableQuery, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
module.exports = { ensureOtpTableExists };
