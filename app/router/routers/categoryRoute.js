const express = require('express');
const route = express.Router();
const { auth } = require('../../middleware/auth');
const { add_Category, view_Category, edit_category, delete_category } = require('../../controller/categoryController')


route.post('/registration', auth(), add_Category);
route.get('/', auth(), view_Category);
route.put('/editCategory/:id', auth(), edit_category);
route.delete('/delete/:id', auth(), delete_category);

module.exports = route;