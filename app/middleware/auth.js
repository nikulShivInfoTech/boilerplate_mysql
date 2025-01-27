const jwt = require('jsonwebtoken');
require('dotenv').config();
const message = require('../utils/message');

const auth = () => {
  return (req, res, next) => {
    const tokenHeader = req.header('Authorization');
    if (!tokenHeader) {
      return res
        .status(401)
        .json({ success: false, message: message.NO_TOKEN });
    }

    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: message.INVALID_TOKEN_FORMAT });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ success: false, message: message.TOKEN_EXPIRED });
      }
      return res
        .status(401)
        .json({ success: false, message: message.INVALID_TOKEN });
    }
  };
};

module.exports = { auth };
