const mongoose = require('mongoose');

// Video Schema
const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'], // Validation with a custom error message
        trim: true // Automatically removes leading and trailing spaces
    },
    redirectLink: {
        type: String,
        required: false, // Optional field
        trim: true, // Automatically removes leading and trailing spaces
        validate: {
            validator: function (v) {
                // Basic URL validation (supports http and https)
                return /^https?:\/\/[^\s]+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a model from the schema
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
