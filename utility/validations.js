const Joi = require('joi');


const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()]).{8,}$/
const otpPattern = /^\d{6}$/
const uuidPattern = /^[a-zA-Z0-9-]+$/i
const searchPattern = /^[a-zA-Z0-9][a-zA-Z0-9,.'!;:"?+=#@$%&()*-_\s]*$/;
const generalTextPattern = /^[a-zA-Z0-9][a-zA-Z0-9,.'!;:"?+=#@$%&()*-_\s]+$/;
const tokenPattern = /^[a-zA-Z0-9]+$/i
const namePattern = /^[A-Za-z]/
const capsPattern = /^[A-Z]+$/

exports.clientSignUpSchema = Joi.object({
  first_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  last_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
  .pattern(RegExp(passwordPattern))
  .messages({
      'string.pattern.base': 'Invalid entry. Password must cointain a minimum of 8 characters, and at least one uppercase letter, number, and special character'
  })
  .required()
})

exports.agentSignUpSchema = Joi.object({
  first_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  last_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  email: Joi.string().email().required(),
  department: Joi.string().pattern(RegExp(capsPattern)).required(),
  is_admin: Joi.boolean().optional(),
  password: Joi.string()
  .pattern(RegExp(passwordPattern))
  .messages({
      'string.pattern.base': 'Invalid entry. Password must cointain a minimum of 8 characters, and at least one uppercase letter, number, and special character'
  })
  .required()
})

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

exports.rateTicketSchema = Joi.object({
  ticketId: Joi.string().regex(/^[A-Z0-9]+$/).required(),
  rating: Joi.string().regex(/^(10|[1-9])$/)
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


exports.staffProfileUpdateSchema = Joi.object({
  first_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  last_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(), 
  email: Joi.string().email().required(),
  department:  Joi.string().pattern(RegExp(capsPattern)).required(),
  is_admin: Joi.boolean().optional(), // added newly
  two_fa_enabled: Joi.boolean().optional()
})



exports.clientProfileUpdateSchema = Joi.object({
  first_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  last_name: Joi.string().min(2).max(255)
  .pattern(RegExp(namePattern))
  .messages({
    'string.pattern.base': 'Invalid name entry'
  })
  .required(),
  email: Joi.string().email().required(),
  location: Joi.string().required(),
  phone: Joi.string().required(),
  two_fa_enabled: Joi.boolean().optional()
})


exports.editAdminTicketSchema = Joi.object({
  ticket_id: Joi.string().regex(/^[A-Z0-9]+$/).required(),
  email: Joi.string().email().required(),
  priority: Joi.string().pattern(RegExp(capsPattern)).required(),
  status: Joi.string().regex(/^[A-Z _-]+$/).required()
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


  exports.tokenSchema = Joi.object({
    token: Joi.string().min(30).max(30)
    .pattern(RegExp(tokenPattern))
    .messages({
      'string.pattern.base': 'Invalid token'
    })
})


exports.clientCreateTicketSchema = Joi.object({
  title: Joi.string().min(2).max(50).required()
  .pattern(RegExp(searchPattern))
    .min(1)
    .required()
    .messages({
        'string.pattern.base': 'Invalid Characters detected. Make title as simple as possible'
    }),
  desc: Joi.string().min(2)
  .pattern(RegExp(generalTextPattern))
    .min(1)
    .required()
    .messages({
        'string.pattern.base': 'Invalid. Malicious characters detected'
    })

})


exports.agentCreateTicketSchema = Joi.object({
  client_email: Joi.string().email().required(),
  title: Joi.string().min(2).max(50).required()
  .pattern(RegExp(searchPattern))
    .min(1)
    .required()
    .messages({
        'string.pattern.base': 'Invalid Title.'
    }),
  desc: Joi.string().min(2)
  .pattern(RegExp(generalTextPattern))
    .min(1)
    .required()
    .messages({
        'string.pattern.base': 'Invalid. Malicious characters detected'
    }),
  priority: Joi.string().pattern(RegExp(capsPattern)).required()
})


exports.chatMessage = Joi.object({

  message: Joi.string().min(2)
  .pattern(RegExp(generalTextPattern))
    .min(1)
    .required()
    .messages({
        'string.pattern.base': 'Invalid. Malicious characters detected'
    }),
  ticketId: Joi.string().regex(/^[A-Z0-9]+$/).required(),
  image: Joi.string().allow(null).optional(), // Allow string or null
})

  