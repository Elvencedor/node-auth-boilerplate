const mongoose = require('mongoose')

const store = mongoose.model(
  'Store',
  new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    website: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })
)

module.exports = store