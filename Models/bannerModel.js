const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: true,
    },
    bannerType: {
      type: String,
      enum: ["mobile", "desktop"],
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
   
    bannerText: {
      type: String,
      trim: true,
    },
    PageWiseBanner: {
      type: String,
      trim: true,
    },
 
    isMobile: {
      type: Boolean,
      default: true,
    },
    redirectLink: {  // New field for redirect URL
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/[^\s]+$/.test(v);  // Basic validation for URL format
        },
        message: props => `${props.value} is not a valid URL!`
      },
    },
  },
  
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;