const Joi = require("joi");

const testimonial = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    "string.base": '"name" should be a type of string',
    "string.empty": '"name" cannot be an empty field',
    "string.min": '"name" should have a minimum length of {#limit}',
    "string.max": '"name" should have a maximum length of {#limit}',
  }),
  description: Joi.string().min(10).max(500).optional().messages({
    "string.base": '"description" should be a type of string',
    "string.empty": '"description" cannot be an empty field',
    "string.min": '"description" should have a minimum length of {#limit}',
    "string.max": '"description" should have a maximum length of {#limit}',
  }),
  rating: Joi.number().min(1).max(5).optional().messages({
    "number.base": '"rating" should be a number',
    "number.min": '"rating" should be at least {#limit}',
    "number.max": '"rating" should be at most {#limit}',
  }),
});

const testimonialEdit = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    "string.base": '"name" should be a type of string',
    "string.empty": '"name" cannot be an empty field',
    "string.min": '"name" should have a minimum length of {#limit}',
    "string.max": '"name" should have a maximum length of {#limit}',
  }),
  description: Joi.string().min(10).max(500).optional().messages({
    "string.base": '"description" should be a type of string',
    "string.empty": '"description" cannot be an empty field',
    "string.min": '"description" should have a minimum length of {#limit}',
    "string.max": '"description" should have a maximum length of {#limit}',
  }),
  rating: Joi.number().min(1).max(5).optional().messages({
    "number.base": '"rating" should be a number',
    "number.min": '"rating" should be at least {#limit}',
    "number.max": '"rating" should be at most {#limit}',
  }),
});

module.exports = { testimonial, testimonialEdit };
