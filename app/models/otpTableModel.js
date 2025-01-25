const { db } = require("./userTableModel");

const ensureOtpTableExists = async () => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_otp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        otp INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    return new Promise((resolve, reject) => {
        db.query(createTableQuery, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};
module.exports={ensureOtpTableExists,db}