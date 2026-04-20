const Crop = require("../Models/ruralModel");
const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const mime = require("mime-types");
const uploadFileToFirebase = require("../Utils/firebaseUpload");
const path = require('path');
const fs = require("fs");

exports.uploadCropDetails = async (req, res, next) => {
 
  console.log("Received request to upload crop details");
  console.log("Request body:", req.body);
  console.log("Uploaded files:", req.files);

  const { thumbnail, pdf } = req.files || {};

 
  if (!thumbnail || thumbnail.length === 0 || !thumbnail[0].path) {
    console.error("Thumbnail is missing or invalid");
    return res.status(400).json({
      status: 'error',
      message: 'Thumbnail image is required.',
    });
  }
  if (!pdf || pdf.length === 0 || !pdf[0].path) {
    console.error("PDF is missing or invalid");
    return res.status(400).json({
      status: 'error',
      message: 'PDF file is required.',
    });
  }

  console.log("Thumbnail path:", thumbnail[0].path);
  console.log("PDF path:", pdf[0].path);

  try {
    console.log("Uploading thumbnail to Firebase...");
    const getThumbnailImageUrl = await uploadFileToFirebase(thumbnail[0]);
    console.log("Thumbnail uploaded successfully:", getThumbnailImageUrl);

    console.log("Uploading PDF to Firebase...");
    const getpdfUrl = await uploadFileToFirebase(pdf[0]);
    console.log("PDF uploaded successfully:", getpdfUrl);

    
    const cropdata = {
      ...req.body,
      thumbnail: getThumbnailImageUrl,
      pdf: getpdfUrl,
    };

    console.log("Saving crop data to the database:", cropdata);
    const crop = await Crop.create(cropdata);
    console.log("Crop data saved successfully:", crop);

    // Send success response
    res.status(201).json({
      status: "success",
      data: { crop },
    });
  } catch (error) {
    console.error("Error uploading or saving crop details:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process and save the crop data.',
      error: error.message,
    });
  }
};

exports.getAllCropDetails = async (req, res) => {
  try {
    console.log("Fetching all crop details from the database...");

    // Fetch all crop records from the database
    const crops = await Crop.find();

    if (crops.length === 0) {
      console.warn("No crops found in the database.");
      return res.status(404).json({
        status: 'error',
        message: 'No crop details available.',
      });
    }

    console.log("Successfully fetched crop details:", crops);

    res.status(200).json({
      status: 'success',
      data: { crops },
    });
  } catch (error) {
    console.error("Error fetching crop details from the database:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve crop details.',
      error: error.message,
    });
  }
};



