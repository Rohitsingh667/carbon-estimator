import { RequestHandler } from "express";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const testUploadMiddleware = upload.single('image');

export const handleTestUpload: RequestHandler = async (req, res) => {
  try {
    console.log("Test upload request received");
    console.log("Headers:", req.headers);
    console.log("Body keys:", Object.keys(req.body));
    console.log("File:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");

    if (!req.file) {
      return res.status(400).json({ 
        error: "No image file uploaded in test",
        received: Object.keys(req.body)
      });
    }

    res.json({
      success: true,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      message: "Test upload successful"
    });
  } catch (error) {
    console.error("Error in test upload:", error);
    res.status(500).json({ 
      error: `Test upload error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
};
