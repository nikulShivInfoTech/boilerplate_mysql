const express = require('express');
const router = express.Router();
const user = require('./routers/userRoute');
const category=require('./routers/categoryRoute')
const product=require('./routers/productRoute')
const testimonial=require('./routers/testimonialRoute')

router.use('/user', user);
router.use('/category', category);
router.use('/product', product);
router.use('/testimonial', testimonial);

module.exports = router;
