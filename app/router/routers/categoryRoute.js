const express = require('express');
const route = express.Router();
const { auth } = require('../../middleware/auth');
const { addCategory, listCategory, editCategory, deleteCategory, viewCategory } = require('../../controller/categoryController')


route.post('/registration', auth(), addCategory);
route.post('/:id', auth(), viewCategory);
route.get('/', auth(), listCategory);
route.put('/editCategory/:id', auth(), editCategory);
route.put('/delete/:id', auth(), deleteCategory);

module.exports = route;