const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.User = require('./user.model');
db.Store = require('./store.model');

db.ROLES = ['public', 'admin', 'merchant', 'internal']

module.exports = db