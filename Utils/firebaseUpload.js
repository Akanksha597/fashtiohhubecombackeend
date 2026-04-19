const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "currymate-spices.firebasestorage.app",
});

const bucket = admin.storage().bucket();

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param {Object} file - The file object from Multer.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */

const uploadFileToFirebase = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("file", file);
      if (!file) {
        throw new Error("File is required for upload.");
         
      }

      const filePath = file.path;
      
      console.log("filePath", filePath);
      if(!file){
        console.log("path is ot found")
        return
      }
      // Common upload path: 'uploads/timestamp-originalFileName'
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      const fileBuffer = fs.readFileSync(filePath);

      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: Date.now(), // Generate a unique token
          },
        },
      });

      blobStream.on("finish", async () => {
        try {
          const metadata = await blob.getMetadata();
          const token = metadata[0].metadata.firebaseStorageDownloadTokens;
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
            bucket.name
          }/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

          // Clean up local file
          fs.unlinkSync(filePath);
          console.log("publicUrl", publicUrl);

          resolve(publicUrl);
        } catch (error) {
          resolve(null);
        }
      });

      blobStream.end(fileBuffer);
    } catch (error) {
      console.log("error in try catch", error);
      resolve(null);
    }
  });
};

module.exports = uploadFileToFirebase;
