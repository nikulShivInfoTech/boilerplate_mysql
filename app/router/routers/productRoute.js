const express = require('express');
const upload = require('../../middleware/multer')
const route = express.Router();
const { auth } = require('../../middleware/auth');
const { productAdd, productImageUpload, productView, listProduct,editProduct } = require('../../controller/productController')

route.post('/add', auth(), productAdd)
route.post('/addProductImage', auth(), upload.any(), productImageUpload);
route.put('/edit/:id', auth(), upload.any(), editProduct);
route.post('/view/:id', auth(), productView);
route.post('/view', auth(), listProduct);

module.exports = route