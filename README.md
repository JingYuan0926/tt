# Tea Time

**Tackling Challenge 2: Digital integrity in the age of misinformation**

**Empowering informed conversations: AI-powered sentiment & bias analysis on Malaysia’s news**

![Image](https://github.com/JingYuan0926/tt/blob/main/public/LandingPage.png?raw=true)
![Image](https://github.com/JingYuan0926/tt/blob/main/public/News.png?raw=true)


Check out the live demo of **Tea Time**: 👉 [Click here to try it out](https://tt-ruby-chi.vercel.app)

 
##Demo Video

https://github.com/user-attachments/assets/c3236e43-19b6-4966-934c-f485a9f14714

## Inspiration: How We Came Up With This Idea 💡

We noticed even perfectly accurate information can get twisted as it passes from person to person, just like the classic “telephone game.” For instance, the word “Polish” might be taken as the country or as nail cleaner, and “present” can mean now or gift, depending on who hears it. Misinterpretation often happens not because the facts are wrong, but because people miss the broader context.

> *“What if there were a way to let everyone see the full picture, so that every nuance of a news article is preserved?”*

That question sparked Tea Time. By combining crowdsourced commentary with AI-driven sentiment analysis (to see how everyone comments) and bias analysis (to flag where an article slants), then providing a concise summary to guide interpretation, we ensure no detail is lost in transmission and that misinformation gets caught before it spreads.


This exploration led us to design the platform Tea Time as a responsive PWA with support for any device, tailored for Malaysia, that:

- **Aggregates news directly from Bernama and other sources**  
- **Allows anyone to comment** on any article, thus building a crowdsourced view of public sentiment  
- **Uses AI to classify comments** as positive, negative, or neutral  
- **Generates bias-analysis reports** on each article, flagging potential slants and offering reading guidance  
- **Highlights “the bigger picture”** to prevent misinterpretation by using AI  
- **Implements KYC verification** to ensure user accountability and constructive engagement  
- **Encrypts user data** using elliptic curve cryptography for secure storage in the database  


## Getting Started 🚀

Clone the repository and start the development server:

```bash
git clone https://github.com/JingYuan0926/tt.git
cd tt
npm install
npm run dev
```

## System Architecture High-Level Overview🏗️
![Image](https://github.com/JingYuan0926/tt/blob/main/public/Architecture.png?raw=true)


## Technology Used 🛠️

- **Cursor** for code assistant
- **ChatGPT** for code debugging
- **NextUI** for frontend components  
- **shadcn/ui** for UI primitives  
- **HeroUI** for design elements  
- **Tailwind CSS** for utility-first styling  
- **GNews API** for news aggregation  
- **Resend API** for OTP delivery  
- **Stripe** for payment processing  
- **MongoDB** as the primary database  
- **OpenAI GPT-4o-mini** for AI-driven sentiment & bias analysis & AI summaries 
- **Gemini 1.5 flash** for document parsing & KYC  
- **Elliptic Curve Cryptography** for secure KYC data encryption  
- **Google Chrome Extension** for in-page AI summaries & bias checks  
- **Progressive Web App (PWA)** support for any device including web and mobile


### Important Endpoints
- **NLP for Comments Processing**  
  `/pages/api/analyzeComments.js`

- **Computer Vision for Document Parsing**  
  `/pages/api/parse-ic-documents.js`

- **Multi-Platform Support**  
  `/extension`

- **Stripe Payment for Secure Checkout**  
  `/pages/api/create-checkout-session.js`

- **Elliptic Curve Cryptography encryption**  
  `/lib/cryptography.js`

- **MongoDB Database Storage**  
  `/pages/api/comments.js`  
  `/pages/api/fetch-news.js`  
  `/pages/api/register.js`

- **LLM for News Analysis and Recommendation**  
  `/pages/api/analyze-news.js`

- **AI for Multi-News Source Aggregation**  
  `/pages/api/generate-sources.js`
  

## Team Members 👥

- **Derek Liew Qi Jian**  
  - *Role*: Project Lead, Front End  
  - [LinkedIn](https://www.linkedin.com/in/derek2403/) | [Twitter](https://x.com/derek2403)

- **Phen Jing Yuan**  
  - *Role*: Back End  
  - [LinkedIn](https://www.linkedin.com/in/jing-yuan-phen-b42266295/) | [Twitter](https://x.com/ilovedahmo)

- **Marcus Tan Chi Yau**  
  - *Role*: Frontend Developer & UI/UX Design  
  - [LinkedIn](https://www.linkedin.com/in/marcus-tan-8846ba271/)

- **Cedric Chung Theng Fung**  
  - *Role*: Full Stack  
  - [LinkedIn](https://www.linkedin.com/in/cedric-chung-2756b4310/)





