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

# Project Documentation

This project includes OTP (One-Time Password) authentication using Resend API for email delivery.

## 🔧 Environment Setup

### Resend API Configuration

To enable OTP email functionality, you need to configure the Resend API:

1. **Get a Resend API Key:**
   - Visit [https://resend.com/api-keys](https://resend.com/api-keys)
   - Create an account if you don't have one
   - Generate a new API key

2. **Create Environment File:**
   ```bash
   # Create .env.local file in the project root
   cp .env.example .env.local  # If .env.example exists
   # OR create .env.local manually
   ```

3. **Add your API key to `.env.local`:**
   ```bash
   # Resend API Configuration
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

4. **Verify Your Domain (Optional for Production):**
   - Go to [https://resend.com/domains](https://resend.com/domains)
   - Add and verify your domain
   - Update the `from` email in `pages/api/send-otp.js` to use your verified domain

5. **For Development Testing:**
   - You can use the sandbox domain: `onboarding@resend.dev`
   - This is already configured in the code for testing

## 🚀 OTP Features

### Available API Endpoints:

- **POST `/api/send-otp`** - Send OTP to Gmail address
- **POST `/api/verify-otp`** - Verify the OTP code

### Frontend Features:

- **Regular signin** with username/password
- **OTP signin** with Gmail verification
- **Smooth transitions** between signin modes
- **Form validation** and error handling
- **Professional email templates** for OTP delivery

### Security Features:

- **6-digit OTP** generation
- **10-minute expiration** for OTP codes
- **One-time use** OTP validation
- **Gmail address validation**
- **Rate limiting** protection (via in-memory storage)

## 📧 Email Template

The OTP emails include:
- Professional HTML design
- Clear 6-digit code display
- Security warnings and instructions
- Expiration time notifications

## 🔒 Production Considerations

For production deployment:

1. **Replace in-memory OTP storage** with Redis or database
2. **Configure proper domain verification** in Resend
3. **Add rate limiting** for API endpoints
4. **Implement user authentication state** management
5. **Add proper logging** and monitoring
6. **Set up email delivery monitoring** in Resend dashboard

## 🧪 Testing

To test the OTP functionality:

1. Start the development server: `npm run dev`
2. Go to `/signin`
3. Click "Sign in with OTP"
4. Enter a Gmail address
5. Check your email for the OTP code
6. Enter the code to complete signin
