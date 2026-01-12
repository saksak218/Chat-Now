# Chat Now 🤖

A modern, responsive AI chat application built with Next.js, featuring multiple AI models, file uploads, and real-time conversations.

## 🚀 Live Demo

🌐 **[Chat Now Live Preview](https://chat-now-tau.vercel.app/)**

## 🌟 Features

### 🤖 Multiple AI Models
- **Google Gemini** - Advanced multimodal AI with vision capabilities
- **Mistral AI** - Fast and efficient text-only conversations

### 📁 File Upload & Vision
- Upload images and files for analysis (Gemini only)
- Automatic file type detection and validation
- Real-time preview with drag-and-drop support

### 🎨 Modern UI/UX
- **Glassmorphism design** with beautiful gradients
- **Responsive design** - works perfectly on desktop, tablet, and mobile
- **Dark theme** with customizable accents
- **Smooth animations** and transitions

### 🔐 Authentication
- Secure user authentication with Better Auth
- Persistent sessions and user management
- Protected routes and data security

### 💬 Chat Management
- **Real-time conversations** with streaming responses
- **Chat history** with search functionality
- **Auto-generated titles** for conversations
- **Delete and organize** chats easily

### 🚀 Performance
- **Server-side rendering** with Next.js 14+
- **Optimized bundle** with code splitting
- **Fast API responses** with intelligent fallbacks
- **TypeScript** for type safety and better DX

## 🛠️ Tech Stack

- **Frontend:** Next.js 16+, TypeScript, Tailwind CSS
- **Backend:** Convex (Database & Real-time)
- **Authentication:** Better Auth
- **AI Integration:** Google Gemini API, Mistral AI
- **UI Components:** Radix UI, Lucide Icons
- **State Management:** React Hooks
- **Deployment:** Vercel

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **Git** for cloning the repository

## 🏃‍♂️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/saksak218/Chat-Now.git
cd Chat-Now
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your API keys:

```env
# Convex (Database & Backend)
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment

# Authentication
BETTER_AUTH_SECRET=your_better_auth_secret
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url

# AI APIs (choose based on your needs)
GOOGLE_API_KEY=your_google_gemini_api_key
MISTRAL_AI_API_KEY=your_mistral_api_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set up Convex Backend

```bash
# Install Convex CLI
npm install -g convex

# Initialize Convex
npx convex dev
```


### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
Chat-Now/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── chat/             # Chat-specific components
│   ├── ui/               # Reusable UI components
│   └── shared/           # Shared components
├── convex/               # Convex backend functions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── constants/            # App constants
```

## 🎯 Key Features Explained

### Multi-Model AI Support
- **Gemini**: Best for multimodal (text + images), most capable
- **Mistral**: Fast text-only responses, great for quick chats

### Intelligent File Handling
- File uploads are automatically disabled for models that don't support them
- Images are previewed before sending
- Files are securely stored and processed

### Responsive Design
- **Mobile-first** approach with touch-friendly interfaces
- **Adaptive layouts** that work on all screen sizes
- **Optimized performance** across devices

## 🔧 Configuration

### Model Selection
Users can switch between AI models in real-time. Each model has different capabilities:

- **Google Gemini**: Multimodal, creative, comprehensive responses
- **Mistral AI**: Fast, efficient, cost-effective

### File Upload Limits
- **Maximum file size**: 10MB per file
- **Supported formats**: Images (JPG, PNG, WebP, GIF), Documents (PDF, TXT)
- **Auto-validation**: Files are checked before upload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Convex** - Real-time database and backend
- **Vercel** - Deployment platform
- **Google Gemini** - Advanced AI capabilities
- **Mistral AI** - Efficient language models

## 📞 Support

If you have any questions or need help:

- 📧 Open an issue on GitHub
- 💬 Check the documentation
- 🌐 Visit the live demo

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
