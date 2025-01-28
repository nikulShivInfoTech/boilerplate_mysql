const Joi = require('joi')

const product = Joi.object({
    product_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
        'string.base': '"name" should be a type of string',
        'string.empty': '"name" cannot be an empty field',
        'string.min': '"name" should have a minimum length of {#limit}',
        'string.max': '"name" should have a maximum length of {#limit}',
        'any.required': '"name" is a required field'
    }),

description: Joi.string()
    .min(1)
    .max(500)
    .optional()
    .messages({
        'string.base': '"description" should be a type of string',
        'string.empty': '"description" cannot be an empty field',
        'string.min': '"description" should have a minimum length of {#limit}',
        'string.max': '"description" should have a maximum length of {#limit}'
    }),   
     category_id: Joi.string()
    .required()
    .messages({
        'string.base': '"category" should be a type of string',
        'any.required': '"category" is a required field',
        'string.empty': '"category" cannot be an empty field',
    }),
})

const productEdit = Joi.object({
    product_name: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.base': '"product_name" should be a type of string',
        'string.empty': '"product_name" cannot be an empty field',
        'string.min': '"product_name" should have a minimum length of {#limit}',
        'string.max': '"product_name" should have a maximum length of {#limit}',
        'any.required': '"product_name" is a required field'
      }),
  
    description: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.base': '"description" should be a type of string',
        'string.empty': '"description" cannot be an empty field',
        'string.min': '"description" should have a minimum length of {#limit}',
        'string.max': '"description" should have a maximum length of {#limit}',
        'any.required': '"description" is a required field'
      }),
  
    category_id: Joi.number()
      .required()
      .messages({
        'number.base': '"category_id" should be a type of number',
        'any.required': '"category_id" is a required field',
        'string.empty': '"category_id" cannot be an empty field',
      }),
  
    image: Joi.string()
      .optional()
      .messages({
        'string.base': '"image" should be a type of string',
      }),
  });
  
module.exports={ product, productEdit }

