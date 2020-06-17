const mongoose = require('mongoose')

const Store = mongoose.model(
  'Store',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      unique: false,
    },
    description: {
      type: String
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
      required: true,
      unique: true
    }
  })
)

module.exports = Store;
