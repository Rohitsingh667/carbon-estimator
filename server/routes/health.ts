import { RequestHandler } from "express";

export const handleHealth: RequestHandler = (req, res) => {
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    api_configured: hasApiKey,
    message: hasApiKey 
      ? "Carbon Footprint Estimator is ready" 
      : "OpenRouter API key not configured"
  });
};
