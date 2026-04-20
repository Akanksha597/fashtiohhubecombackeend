const fs = require("fs");
const admin = require("firebase-admin");
const initFirebase = require("./firebase");

initFirebase(); // initialize once

const bucket = admin.storage().bucket();

const uploadFileToFirebase = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      const filePath = file.path;
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      const fileBuffer = fs.readFileSync(filePath);

      const blob = bucket.file(fileName);

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: Date.now().toString(),
          },
        },
      });

      blobStream.on("error", (err) => {
        console.error("Upload Error:", err);
        reject(err);
      });

      blobStream.on("finish", async () => {
        try {
          const [metadata] = await blob.getMetadata();
          const token = metadata.metadata.firebaseStorageDownloadTokens;

          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
            bucket.name
          }/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

          fs.unlinkSync(filePath); // delete local file

          resolve(publicUrl);
        } catch (err) {
          console.error("Metadata Error:", err);
          reject(err);
        }
      });

      blobStream.end(fileBuffer);
    } catch (error) {
      console.error("Upload Failed:", error);
      reject(error);
    }
  });
};

module.exports = uploadFileToFirebase;