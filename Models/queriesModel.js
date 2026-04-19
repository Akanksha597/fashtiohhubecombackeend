const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    dbCart: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String, 
          required: [true, "Name is required"],
        },
        email: {
          type: String,
          required: [true, "Email is required"],
        },

        mobile: {
          type: Number,
        }
      },
    ],
    title: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      required: true,
    },
    issue_msg: {
      type: String,
      required: true,
    },
    resolve_status: {
      type: String,
      enum: ['Pending', 'Read', 'Resolved'],
      default: 'Pending',
    },
    resolve_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    after_resolution_msg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
