const mongoose = require('mongoose');

//スキーマ定義
const userSchema = new mongoose.Schema({
  phone_number: {
    type: String,
    required: true,
    maxlength: 11,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true
  },
  state_left: {
    type: String
  },
  state_mid: {
    type: String
  },
  state_right: {
    type: Number
  },
  is_admin: {
    type: Boolean,
    required: true
  }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);