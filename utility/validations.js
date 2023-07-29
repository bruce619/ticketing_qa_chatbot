const Joi = require('joi');


const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]+$/
const otpPattern = /^\d{6}$/
const uuidPattern = /^[a-zA-Z0-9-]+$/i
const searchPattern = /^[a-zA-Z0-9][a-zA-Z0-9,:.\s]*$/;
const tokenPattern = /^[a-zA-Z0-9]+$/i


exports.clientSignUpSchema = Joi.object({
    first_name: Joi.string().pattern(/^[A-Za-z]/).required(),
    last_name: Joi.string().pattern(/^[A-Za-z]/).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
    .pattern(RegExp(passwordRegex))
    .messages({
        'string.pattern.base': 'Invalid entry. Password must cointain a minimum of 8 characters, and at least one uppercase letter, number, and special character'
    })
    .required()
})

exports.agentSignUpSchema = Joi.object({
    first_name: Joi.string().pattern(/^[A-Za-z]/).required(),
    last_name: Joi.string().pattern(/^[A-Za-z]/).required(),
    email: Joi.string().email().required(),
    department: Joi.string().regex(/^[A-Z]+$/).required(),
    is_admin: Joi.boolean().required(),
    password: Joi.string()
    .pattern(RegExp(passwordRegex))
    .messages({
        'string.pattern.base': 'Invalid entry. Password must cointain a minimum of 8 characters, and at least one uppercase letter, number, and special character'
    })
    .required()
})

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})


exports.otpSchema = Joi.object({
    otp: Joi.string()
    .min(6)
    .max(6)
    .required()
    .pattern(RegExp(otpPattern))
    .messages({
      'string.pattern.base': 'Invalid OTP.'
  }),
  
  id: Joi.string()
  .pattern(RegExp(uuidPattern))
  .required()
  .messages({
      'string.pattern.base': 'Invalid ID.'
  })
  
  })

exports.uuidSchema = Joi.object({
    id: Joi.string()
      .pattern(RegExp(uuidPattern))
      .required()
      .messages({
          'string.pattern.base': 'Invalid ID.'
      })
  
  });

exports.ticketIDSearchSchema = Joi.object({
    ticket_id: Joi.string()
      .pattern(RegExp(searchPattern))
      .min(1)
      .required()
      .messages({
          'string.pattern.base': 'Invalid Ticket ID.'
      })
  
  });


exports.userSearchSchema = Joi.object({
    search: Joi.string()
      .pattern(RegExp(searchPattern))
      .min(1)
      .required()
      .messages({
          'string.pattern.base': 'Invalid search.'
      })
  
  });


exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
  })


exports.passwordResetSchema = Joi.object({
    password: Joi.string()
      .pattern(RegExp(passwordPattern))
      .messages({
        'string.pattern.base': 'Invalid entry. Password must cointain a minimum of 8 characters, and at least one uppercase letter, number, and special character'
      })
      .required(),
      token: Joi.string().min(30).max(30)
      .pattern(RegExp(tokenPattern))
      .messages({
        'string.pattern.base': 'Invalid token'
      })
  
  })
  