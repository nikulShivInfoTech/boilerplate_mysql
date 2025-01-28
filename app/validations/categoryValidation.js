const Joi = require('joi')

const category = Joi.object({
    category_name: Joi.string().required().trim().messages({
        'string.base': 'Category name must be a string',
        'string.empty': 'Category name cannot be empty',
        'any.required': 'Category name is a required field',
    })
});
module.exports = { category } 
