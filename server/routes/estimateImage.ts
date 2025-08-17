import { RequestHandler } from "express";
import multer from "multer";
import { EstimateResponse } from "@shared/api";
import { CarbonEstimator } from "../services/carbonEstimator";

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

export const uploadMiddleware = (req: any, res: any, next: any) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: `File upload failed: ${err.message}` });
    }
    next();
  });
};

export const handleEstimateImage: RequestHandler = async (req, res) => {
  try {
    console.log("Image upload request received");

    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({
        error: "No image file uploaded. Please provide an image file in the 'image' field."
      });
    }

    console.log(`File received: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not configured - using fallback estimation");
      const fallbackResult = {
        dish: "Unknown Dish (from image)",
        estimated_carbon_kg: 3.2,
        ingredients: [
          { name: "Mixed vegetables", carbon_kg: 0.8 },
          { name: "Grains/Starch", carbon_kg: 1.2 },
          { name: "Protein source", carbon_kg: 1.0 },
          { name: "Seasonings", carbon_kg: 0.2 }
        ]
      };
      return res.json(fallbackResult);
    }

    console.log("API key is configured, proceeding with AI estimation...");

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const estimator = new CarbonEstimator(apiKey);
    const result: EstimateResponse = await estimator.estimateFromImage(imageUrl);

    console.log("Estimation successful:", result.dish);
    res.json(result);
  } catch (error) {
    console.error("Error in /estimate/image endpoint:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: "File too large. Maximum size is 5MB."
        });
      }
      return res.status(400).json({
        error: `File upload error: ${error.message}`
      });
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Detailed error:", errorMessage);

    res.status(500).json({
      error: `Internal server error: ${errorMessage}`
    });
  }
};
