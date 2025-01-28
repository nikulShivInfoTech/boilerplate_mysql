const express = require('express');
const router = express.Router();
const user = require('./routers/userRoute');
const category=require('./routers/categoryRoute')

router.use('/user', user);
router.use('/category', category);

module.exports = router;
