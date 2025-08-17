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

## 📡 API Documentation

### POST /api/estimate

Estimates carbon footprint from dish name.

**Request:**

```json
{
  "dish": "Chicken Biryani"
}
```

**Response:**

```json
{
  "dish": "Chicken Biryani",
  "estimated_carbon_kg": 4.2,
  "ingredients": [
    { "name": "Rice", "carbon_kg": 1.1 },
    { "name": "Chicken", "carbon_kg": 2.5 },
    { "name": "Spices", "carbon_kg": 0.2 },
    { "name": "Oil", "carbon_kg": 0.4 }
  ]
}
```

**Example using curl:**

```bash
curl -X POST http://localhost:8080/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"dish": "Caesar Salad"}'
```

### POST /api/estimate/image

Estimates carbon footprint from uploaded image.

**Request:**

- Content-Type: `multipart/form-data`
- Field: `image` (file)
- Supported formats: JPG, PNG, GIF
- Max size: 5MB

**Response:**

```json
{
  "dish": "Identified Dish Name",
  "estimated_carbon_kg": 3.1,
  "ingredients": [
    { "name": "Lettuce", "carbon_kg": 0.3 },
    { "name": "Chicken", "carbon_kg": 2.2 },
    { "name": "Croutons", "carbon_kg": 0.4 },
    { "name": "Dressing", "carbon_kg": 0.2 }
  ]
}
```

**Example using curl:**

```bash
curl -X POST http://localhost:8080/api/estimate/image \
  -F "image=@path/to/your/food-image.jpg"
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + TypeScript
- **AI**: OpenRouter (Llama 3.2 11B Vision)
- **File Upload**: Multer
- **Validation**: Zod
- **UI Components**: Radix UI + shadcn/ui

### Project Structure

```
├── client/                 # Frontend React app
│   ├── components/ui/      # Reusable UI components
│   ├── pages/             # Page components
│   ├── App.tsx            # Main app component
│   └── global.css         # Global styles
├── server/                # Backend Express app
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   └── index.ts           # Server setup
├── shared/                # Shared types
│   └── api.ts             # API interfaces
└── package.json
```

### Key Design Decisions

1. **AI Integration**: Used OpenRouter for flexible AI model access
2. **Type Safety**: Shared TypeScript interfaces between client/server
3. **Error Handling**: Comprehensive error handling with fallback estimations
4. **UX**: Tabs for different input methods, real-time feedback
5. **Performance**: Image size limits and loading states
6. **Sustainability**: Green color scheme to match the environmental theme

## 🧪 Testing

### Manual Testing

1. **Text Input Test**:
   - Navigate to the app
   - Enter "Chicken Biryani" in the text tab
   - Click "Estimate Carbon Footprint"
   - Verify response shows breakdown

2. **Image Upload Test**:
   - Switch to "Upload Photo" tab
   - Upload a food image
   - Click "Analyze Photo"
   - Verify AI identifies the dish

3. **Error Handling Test**:
   - Try empty input
   - Try uploading non-image file
   - Try very large image
   - Verify appropriate error messages

### API Testing

Test endpoints directly:

```bash
# Test ping endpoint
curl http://localhost:8080/api/ping

# Test text estimation
curl -X POST http://localhost:8080/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"dish": "Beef Burger"}'

# Test image estimation (replace with actual image path)
curl -X POST http://localhost:8080/api/estimate/image \
  -F "image=@food.jpg"
```

## 🚢 Production Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables

Required for production:

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `NODE_ENV`: Set to "production"

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

### Deployment Options

- **Netlify**: Use the MCP integration for easy deployment
- **Vercel**: Connect your repo and deploy automatically
- **Docker**: Build and deploy container to any cloud provider

## 🔒 Security Considerations

- API key stored as environment variable
- File upload size limits (5MB)
- File type validation (images only)
- Input sanitization for dish names
- CORS configuration
- No sensitive data logged

## 📝 Assumptions & Limitations

### Assumptions

1. **Carbon Data**: AI estimates are approximations, not precise scientific data
2. **Portion Sizes**: Assumes standard serving sizes
3. **Regional Variations**: Doesn't account for local sourcing differences
4. **Preparation Methods**: Basic cooking methods assumed

### Limitations

1. **Accuracy**: AI estimations may vary from actual carbon footprints
2. **Data Source**: No real-world carbon database integration
3. **Image Quality**: Poor quality images may affect identification
4. **Rate Limits**: Subject to OpenRouter API limits
5. **Fallback**: Uses generic estimates when AI fails

### Future Improvements

- Real carbon footprint database integration
- User location-based adjustments
- Recipe ingredient quantities
- Seasonal availability factors
- Transportation distance calculations
- User feedback for AI training

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - TypeScript validation

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- Check the console for detailed error messages
- Verify your OpenRouter API key is valid
- Ensure image files are under 5MB
- Report issues with example inputs that fail
