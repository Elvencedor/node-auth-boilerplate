const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: [true, 'This email already exists. Please try to log in instead.'],
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
});


// Generate a password hash (with an auto-generated salt for simplicity here).
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, 8);
};

UserSchema.statics.getUserByEmailAndPassword = async function(email, password) {
  
  const user = await User.findOne({ email });
  if (!user || !user.validatePassword(password)) {
    throw new Error('Wrong Email or Password');
  }
  return user;
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Pre-save hook to ensure consistency.
UserSchema.pre('save', function(next) {
  // Make sure the password is hashed before being stored.
  if (this.isModified('password')) {
    this.password = this.generateHash(this.password);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
