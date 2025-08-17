import { RequestHandler } from "express";
import { EstimateRequest, EstimateResponse } from "@shared/api";
import { CarbonEstimator } from "../services/carbonEstimator";

export const handleEstimate: RequestHandler = async (req, res) => {
  try {
    const { dish }: EstimateRequest = req.body;

    if (!dish || typeof dish !== 'string' || dish.trim().length === 0) {
      return res.status(400).json({ 
        error: "Invalid request. 'dish' field is required and must be a non-empty string." 
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not configured");
      return res.status(500).json({ 
        error: "Server configuration error" 
      });
    }

    const estimator = new CarbonEstimator(apiKey);
    const result: EstimateResponse = await estimator.estimateFromDish(dish.trim());

    res.json(result);
  } catch (error) {
    console.error("Error in /estimate endpoint:", error);
    res.status(500).json({ 
      error: "Internal server error while estimating carbon footprint" 
    });
  }
};
