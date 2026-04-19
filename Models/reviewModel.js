const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product reference is required"],
    },
    rating: { 
        type: Number, 
        required: true,
         min: 1, max: 5
         },
    description: { 
        type: String,
         required: true 
        },
        status: { 
            type: String, 
            enum: ['active', 'inactive'],
            default: 'active' 
          },
    // status: { 
    //     type: String, 
    //     enum: ['approved', 'pending', 'rejected'],
    //      default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
