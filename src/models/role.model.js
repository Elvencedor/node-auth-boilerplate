const mongoose = require('mongoose')
const Role = mongoose.model(
  'Role',
  new mongoose.Schema({
    name: {
      type: String,
      enum: ['admin', 'public', 'internal', 'merchant'],
      required: true
    }
  })
)

module.exports = Role