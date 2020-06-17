const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const UserSchema = mongoose.model(
  'User',
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
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
    isActive: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    },
  })
)

// Make sure the email has not been used.
UserSchema.path('email').validate({
  validator: function(email, callback) {
    const UserInstance = mongoose.model('User');
    // Check only when it is a new user or when the email has been modified.
    if (this.isNew || this.isModified('email')) {
      UserInstance.find({ email: email }).exec(function(err, users) {
        callback(!err && users.length === 0);
      });
    } else {
      callback(true);
    }
  },
  message: 'This email already exists. Please try to log in instead.',
});


// Generate a password hash (with an auto-generated salt for simplicity here).
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, 8);
};


// Pre-save hook to ensure consistency.
UserSchema.pre('save', function(next) {
  // Make sure the password is hashed before being stored.
  if (this.isModified('password')) {
    this.password = this.generateHash(this.password);
  }
  next();
});



module.exports = UserSchema;
