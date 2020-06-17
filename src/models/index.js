const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Roles = {
    'admin': 'admin',
    'public': 'public',
    'merchant': 'merchant',
    'internal': 'internal'
};

const db = {};

db.mongoose = mongoose;

db.User = require('./user.model');
db.Store = require('./store.model');

db.ROLES = Object.keys(Roles);

module.exports = db;
