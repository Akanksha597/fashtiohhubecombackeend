const mongoose = require("mongoose");

const generalSettingSchema = new mongoose.Schema({
  systemTitle: 
  { 
    type: String,
     required: true 
    },
  address:
   {
     type: String 
    },
    thumbnail:
   { 
    type: String,
    required: [false, "Thumbnail image is required"],
},
  favicon: 
  {
     type: String 
    },
  createdAt: 
  { 
    type: Date,
     default: Date.now 
    },
});

const GeneralSetting = mongoose.model("GeneralSetting", generalSettingSchema);

module.exports = GeneralSetting;
