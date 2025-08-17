### Prerequisites

- Node.js
- pnpm
- OpenRouter API key

### Installation

1. Clone and Install
   git clone <repository-url>
   cd carbon-footprint-estimator
   pnpm install

2. Environment Setup

   Create `.env` and add your OpenRouter API key:

3. Start Development

   pnpm dev

##  Error Handling Test:
   - Try empty input
   - Try uploading non-image file
   - Try very large image

### API Testing

Test endpoints directly:

# Test ping endpoint
curl http://localhost:8080/api/ping

# Test text estimation
curl -X POST http://localhost:8080/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"dish": "Beef Burger"}'

# Test image estimation (replace with actual image path)
curl -X POST http://localhost:8080/api/estimate/image \
  -F "image=@food.jpg"

### Key Design Decisions

#### 1. **Shared Types Between Frontend/Server**
# typescript
// shared/api.ts
export interface EstimateResponse {
  dish: string;
  estimated_carbon_kg: number;
  ingredients: Ingredient[];
}

**Reasoning**: Helps avoid type mismatches and makes it safer to refactor. This saved me from multiple bugs that resulted from a different data shape being expected in frontend and backend. 

#### 2. **Separate api endpoints**

// server/services/carbonEstimator.ts
export class CarbonEstimator {
  async estimateFromDish(dishName: string): Promise<EstimateResponse>
  async estimateFromImage(imageUrl: string): Promise<EstimateResponse>
}

**Reasoning**: Decouples logic for AI integration from http handling. This makes it easier to test and also gives us the ability to easily swap AI providers in the future. 

*Reasoning**: Ensures the app always works, even if OpenRouter is down. Better user experience than showing errors.

### Handled Edge Cases:
1. **Empty/Invalid Inputs**

   if (!dish || typeof dish !== 'string' || dish.trim().length === 0) {
     return res.status(400).json({ error: "Invalid dish name" });
   }

2. **Large File Uploads**

   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit

3. **Non-Image File Uploads**

   fileFilter: (req, file, cb) => {
     if (file.mimetype.startsWith('image/')) {
       cb(null, true);
     } else {
       cb(new Error('Only image files allowed'));
     }
   }

4. **AI Response Parsing Failures**

   # Try to parse JSON from AI response
   const jsonMatch = content.match(/\{[\s\S]*\}/);
   if (!jsonMatch) {
     throw new Error("No JSON found in response");
   }

5. **API Response Body Reading Issues**
   # Clone response to avoid "body stream already read" error
   const responseClone = response.clone();
   const responseText = await responseClone.text();

### Current Limitations:
   # No Caching : Same dish analyzed multiple times costs API calls
   # Basic Validation : Only checks for required fields, not data quality

### Production Considerations :

## Security
- Input sanitization and validation (Joi/Zod schemas)
- Rate limiting (express-rate-limit)
- API key rotation mechanism
- Request logging and monitoring

## Performance

- Redis caching for repeated dish estimates
- Image compression before AI processing  

## Privacy

- Image processing: Delete uploaded images after analysis
- Logging: Don't log sensitive user data

### Assumptions Made:
1. **AI Accuracy**: openRouter's Llama model produces reasonable estimates for carbon
2. **Standard Portions**: ai assumes standard serving sizes for menu items
3. **Preparation Methods**: assumed methods of preparing food are standard.

### Current Limitations:
1. **No Historical Data**: No learning will take place from past estimates
2. **Static Carbon Values**: No connection to real-world carbon database
3. **API Dependency**: If OpenRouter goes down, then the AI is completely useless.

