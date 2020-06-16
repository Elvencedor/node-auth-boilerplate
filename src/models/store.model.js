const mongoose = require('mongoose')

const Store = mongoose.model(
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
    slug: {
      type: String,
      required: true
    }
  })
)

module.exports = Store;
