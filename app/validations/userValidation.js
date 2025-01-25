const Joi = require('joi');

const userRegistrationValidation = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .trim()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is a required field',
    }),
  password: Joi.string().min(8).required().trim().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is a required field',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match the password',
    'string.empty': 'Confirm password cannot be empty',
    'any.required': 'Confirm password is a required field',
  }),
});
const loginValidation = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is a required field',
    }),
  password: Joi.string().required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is a required field',
  }),
});


const editUserValidation = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .trim()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is a required field',
    }),
});

const passwordResetValidation = Joi.object({
  currentPassword: Joi.string().required().min(6).messages({
    'string.base': 'Current password must be a string',
    'string.empty': 'Current password cannot be empty',
    'any.required': 'Current password is a required field',
    'string.min': 'Current password must be at least 6 characters long',
  }),
  newPassword: Joi.string().required().min(6).messages({
    'string.base': 'New password must be a string',
    'string.empty': 'New password cannot be empty',
    'any.required': 'New password is a required field',
    'string.min': 'New password must be at least 6 characters long',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match the new password',
    'string.empty': 'Confirm password cannot be empty',
    'any.required': 'Confirm password is a required field',
  }),
});
const emailValidation = Joi.object({
  email: Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .trim()
  .messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is a required field',
  })
});


module.exports = { userRegistrationValidation, loginValidation, editUserValidation, passwordResetValidation, emailValidation };
