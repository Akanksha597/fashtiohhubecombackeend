const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  plantName: {
    type: String,
    required: [true, "Crop name is required"],
   
  },
  plantdescription: {
    type: String,
    required: [true, "Crop description is required"],
  },
  thumbnail: {
    type: String,
    required: false,
  },
  pdf: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


const Crop = mongoose.model("Crop", cropSchema);

module.exports = Crop;
