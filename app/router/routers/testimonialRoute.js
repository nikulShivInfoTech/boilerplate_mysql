const express = require('express');
const route = express.Router();
const { auth } = require('../../middleware/auth');
const {    addTestimonial,
    testimonialView,
    listTestimonial,
    editTestimonial,
    deleteTestimonial } = require('../../controller/testimonialController')

route.post('/add',auth(),addTestimonial)
route.post('/add',auth(),addTestimonial);
route.get('/:id?',auth(),testimonialView);
route.post('/list',auth(),listTestimonial);
route.put('/edit/:id',auth(),editTestimonial);
route.delete('/delete/:id',auth(),deleteTestimonial);

module.exports=route