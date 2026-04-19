const mongoose = require('mongoose');

const bulkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['Customer', 'Supplier'],
  
  },
  productNames: {
    type: [String],
    default: []
  },
  additionalInfo: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

module.exports = mongoose.model('bulk', bulkSchema);
