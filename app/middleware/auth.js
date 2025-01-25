const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = () => {
    return (req, res, next) => {
        const tokenHeader = req.header('Authorization');
        if (!tokenHeader) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
            }
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    };
};

module.exports = { auth };

