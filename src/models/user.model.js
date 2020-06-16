const mongoose = require('mongoose')

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['public','merchant','internal','admin'],
      default: 'public' 
    },
    phone: {
      type: String
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'US' },
      zipCode: { type: String }
    },
    reset_account: {
      reset_at: { type: Date },
      token: { type: String }
    }
  })
)

module.exports = User;
