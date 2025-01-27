const express = require('express');
const route = express.Router();
const {
  registration,
  login,
  viewProfile,
  userEdit,
  resetPassword,
  send_Mail_Of_OTP,
  forgotPassword,
} = require('../../controller/userController');
const { auth } = require('../../middleware/auth');

route.post('/registration', registration);
route.get('/profile', auth(), viewProfile);
route.put('/Editprofile', auth(), userEdit);
route.post('/login', login);
route.post('/reset-password', auth(), resetPassword);
route.post('/forgot-password', forgotPassword);
route.post('/getOtp', send_Mail_Of_OTP);

module.exports = route;
