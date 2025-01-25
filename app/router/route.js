const express = require('express')
const router = express.Router()
const user = require('./routers/userRoute')
router.use('/user', user)

module.exports = router;


