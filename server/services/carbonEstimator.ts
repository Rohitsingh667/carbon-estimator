import { EstimateResponse, Ingredient } from "@shared/api";

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class CarbonEstimator {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async estimateFromDish(dishName: string): Promise<EstimateResponse> {
    try {
      const prompt = `Analyze the dish "${dishName}" and estimate its carbon footprint. 
      
      Please respond with ONLY a valid JSON object in this exact format:
      {
        "dish": "${dishName}",
        "estimated_carbon_kg": <total_carbon_in_kg>,
        "ingredients": [
          {"name": "ingredient_name", "carbon_kg": <carbon_value>}
        ]
      }
      
      Consider typical ingredients, portion sizes, and carbon emissions from agriculture, transport, and preparation. Include 3-6 main ingredients.`;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "carbon-footprint-estimator.app",
          "X-Title": "Carbon Footprint Estimator"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.2-11b-vision-instruct:free",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "temperature": 0.3,
          "max_tokens": 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in OpenRouter response");
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const estimation: EstimateResponse = JSON.parse(jsonMatch[0]);
      
      if (!estimation.dish || !estimation.estimated_carbon_kg || !estimation.ingredients) {
        throw new Error("Invalid response structure from AI");
      }

      return estimation;
    } catch (error) {
      console.error("Error estimating carbon footprint:", error);
      
      return this.getFallbackEstimation(dishName);
    }
  }

  async estimateFromImage(imageUrl: string): Promise<EstimateResponse> {
    try {
      const prompt = `Analyze this food image and identify the dish and its ingredients. Then estimate the carbon footprint.
      
      Please respond with ONLY a valid JSON object in this exact format:
      {
        "dish": "identified_dish_name",
        "estimated_carbon_kg": <total_carbon_in_kg>,
        "ingredients": [
          {"name": "ingredient_name", "carbon_kg": <carbon_value>}
        ]
      }
      
      Consider visible ingredients, estimated portion sizes, and carbon emissions from agriculture, transport, and preparation.`;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "carbon-footprint-estimator.app",
          "X-Title": "Carbon Footprint Estimator"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.2-11b-vision-instruct:free",
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": prompt
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": imageUrl
                  }
                }
              ]
            }
          ],
          "temperature": 0.3,
          "max_tokens": 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in OpenRouter response");
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const estimation: EstimateResponse = JSON.parse(jsonMatch[0]);
      
      if (!estimation.dish || !estimation.estimated_carbon_kg || !estimation.ingredients) {
        throw new Error("Invalid response structure from AI");
      }

      return estimation;
    } catch (error) {
      console.error("Error estimating carbon footprint from image:", error);
      
      return this.getFallbackEstimation("Unknown Dish");
    }
  }

  private getFallbackEstimation(dishName: string): EstimateResponse {
    const fallbackIngredients: Ingredient[] = [
      { name: "Mixed vegetables", carbon_kg: 0.8 },
      { name: "Grains/Rice", carbon_kg: 1.2 },
      { name: "Protein source", carbon_kg: 2.1 },
      { name: "Seasonings", carbon_kg: 0.1 }
    ];

    const totalCarbon = fallbackIngredients.reduce((sum, ingredient) => sum + ingredient.carbon_kg, 0);

    return {
      dish: dishName,
      estimated_carbon_kg: Math.round(totalCarbon * 100) / 100,
      ingredients: fallbackIngredients
    };
  }
}
