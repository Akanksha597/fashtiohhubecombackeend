const GeneralSetting = require('../Models/settingModel')
const mime = require("mime-types");

const asyncErrorHandler = require("../Utils/errorHandler");



exports.saveGeneralSetting = async (req, res) => {
  try {
    console.log("Received ID:", req.params.id);
    console.log("Request Body:", req.body);

    const { systemTitle, address } = req.body;

    // Find existing setting
    let setting = await GeneralSetting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    // Upload new files only if provided
    const thumbnail = req.files?.thumbnail ? await uploadFileToFirebase(req.files.thumbnail[0]) : setting.thumbnail;
    const favicon = req.files?.favicon ? await uploadFileToFirebase(req.files.favicon[0]) : setting.favicon;

    // Debugging file upload
    console.log("Thumbnail URL:", thumbnail);
    console.log("Favicon URL:", favicon);

    // Update values
    setting.systemTitle = systemTitle || setting.systemTitle;
    setting.address = address || setting.address;
    setting.thumbnail = thumbnail;
    setting.favicon = favicon;
    
    await setting.save();

    return res.status(200).json({
      status: "success",
      message: "General settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    console.error("Error saving settings:", error.message);
    res.status(500).json({ error: "An unexpected error occurred while saving settings." });
  }
};
exports.updateGeneralSetting = async (req, res) => {
  try {
    console.log("Updating ID:", req.params.id);
    console.log("Request Body:", req.body);

    const { systemTitle, address } = req.body;

    // Find existing setting
    let setting = await GeneralSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    // Upload new files only if provided
    const thumbnail = req.files?.thumbnail ? await uploadFileToFirebase(req.files.thumbnail[0]) : setting.thumbnail;
    const favicon = req.files?.favicon ? await uploadFileToFirebase(req.files.favicon[0]) : setting.favicon;

    console.log("Updated Thumbnail URL:", thumbnail);
    console.log("Updated Favicon URL:", favicon);

    // Update only the provided values
    if (systemTitle) setting.systemTitle = systemTitle;
    if (address) setting.address = address;
    if (thumbnail) setting.thumbnail = thumbnail;
    if (favicon) setting.favicon = favicon;

    await setting.save();

    return res.status(200).json({
      status: "success",
      message: "General settings updated successfully.",
      data: setting,
    });
  } catch (error) {
    console.error("Error updating settings:", error.message);
    res.status(500).json({ error: "An unexpected error occurred while updating settings." });
  }
};



exports.getGeneralSetting = async (req, res) => {
  try {
    const setting = await GeneralSetting.findOne();
    if (!setting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
