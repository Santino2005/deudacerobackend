# Multiple Intelligences Assessment App

A modern, interactive assessment platform built with Next.js 16 to discover and analyze multiple intelligences based on Gardner's theory.

## 🚀 Ready for Vercel Deployment

This project is **fully optimized and ready to deploy on Vercel**. All configurations are set for production.

### ✅ Deployment Checklist
- ✓ Next.js 16 App Router configured
- ✓ TypeScript ready
- ✓ Tailwind CSS v4 + shadcn/ui components
- ✓ Vercel Analytics integrated
- ✓ Environment variables configured for Vercel
- ✓ No local dependencies or `.env.local` files
- ✓ Supabase authentication ready (add credentials in Vercel Vars)
- ✓ AI SDK v6 configured
- ✓ Builds successfully: `pnpm build`

## 📋 Features

- **8 Intelligence Modules**: Logical-Mathematical, Linguistic, Spatial, Musical, Body-Kinesthetic, Naturalistic, Intrapersonal, and Interpersonal
- **AI-Powered Negotiation Game**: Interactive AI conversations in the Interpersonal module
- **Progress Tracking**: Scores and completion status saved to Supabase
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## 🛠️ Setup

### Local Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

### Environment Variables (Set in Vercel Project Settings)

Required for Supabase authentication and database:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional for AI features (defaults to Vercel AI Gateway):
```
AI_GATEWAY_API_KEY=your_api_key
```

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Auth & Database**: Supabase with SSR
- **AI**: Vercel AI SDK v6 + OpenAI
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📖 For Detailed Setup Instructions

See `SETUP_GUIDE.md` for step-by-step Supabase configuration and feature enablement.

## 🔒 Security

- No local `.env` files in repository
- All secrets managed through Vercel project settings
- Supabase authentication with Row Level Security
- No `__dirname` or incompatible modules
- Edge Runtime compatible code

## 📝 License

MIT
