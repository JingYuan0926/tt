This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Features

- **Multi-step Signup Form**: Clean, modern signup flow with validation
- **Google Gemini AI Integration**: Automatically parse Malaysian IC documents using AI
- **Document Upload & Processing**: Upload IC documents and extract personal details
- **Form Auto-fill**: AI-powered extraction auto-fills personal information
- **Dark/Light Theme**: Toggle between themes with system preference detection

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Gemini API

1. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env.local` file in the project root:

```bash
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env.local` file to version control. The file is already in `.gitignore`.

### 3. Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Testing the IC Document Parser

1. Navigate to the signup page: [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in the account details (Step 1)
3. Upload a clear image of a Malaysian IC document (Step 2)
   - Supported formats: JPEG, PNG, PDF
   - Maximum file size: 10MB
   - Ensure the document is well-lit and all text is clearly visible
4. The AI will automatically parse the document and fill in your personal details (Step 3)
5. Review and verify the extracted information before submitting

### 5. API Endpoints

- `GET /api/health-check` - Check if Gemini API is properly configured
- `POST /api/parse-ic-document` - Parse IC document using Gemini AI
- `POST /api/save-user` - Save user data to JSON file

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured" error**
   - Ensure you have created a `.env.local` file in the project root
   - Verify your API key is correctly set in the file
   - Restart the development server after adding the API key

2. **"Unable to parse IC document" error**
   - Check that the uploaded image is clear and well-lit
   - Ensure the IC document is fully visible in the image
   - Try with different image formats (JPEG, PNG)
   - Verify the file size is under 10MB

3. **API connection issues**
   - Test the API connection: `curl http://localhost:3000/api/health-check`
   - Check your internet connection
   - Verify your Gemini API key is valid and has sufficient quota

### Testing API Connection

You can test if the Gemini API is working by visiting:
```
http://localhost:3000/api/health-check
```

This endpoint will verify your API configuration and connectivity.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
