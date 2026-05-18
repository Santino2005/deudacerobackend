# Multiple Intelligences Assessment App - Setup Guide

## Getting Started

Your Multiple Intelligences Assessment app is ready! To enable full functionality including authentication and data persistence, follow these steps:

### Step 1: Add Supabase Environment Variables

1. Go to your **Supabase project** (https://supabase.com/dashboard)
2. Click **Settings** → **API** in the left sidebar
3. Copy these two values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. In the v0 UI, click the **Settings** button (top right) → **Vars**
5. Add these environment variables:
   - Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: (paste your Project URL)
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: (paste your anon key)

6. Save the variables

### Step 2: Refresh the Preview

The dev server will automatically pick up the new environment variables. Your app should now have:
- ✅ User registration (sign up)
- ✅ User login
- ✅ Secure authentication
- ✅ Progress tracking across modules
- ✅ Database storage for all assessments

### Step 3: Test Authentication

1. Click **Sign In** on the landing page
2. Click **Sign up** to create a test account
3. Enter an email and password
4. Click **Sign up**
5. Confirm your email (check your inbox or Supabase dashboard for confirmation link)
6. Log in with your credentials
7. Access the dashboard and take assessments

## Features Once Authenticated

- **8 Intelligence Modules**: Logical-Mathematical, Linguistic, Spatial, Musical, Body-Kinesthetic, Naturalistic, Intrapersonal, and Interpersonal
- **AI-Powered Negotiation Game**: Interpersonal module uses Claude AI for realistic negotiations
- **Progress Tracking**: Your scores and completion status are saved to Supabase
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Optional: Add AI Features

The Interpersonal module includes an AI-powered negotiation game. By default, it uses OpenAI models. If you want to use a specific AI provider, you can:

1. Set the `AI_GATEWAY_API_KEY` environment variable in Settings → Vars
2. The app will use the specified AI provider for the negotiation scenarios

## Need Help?

If you encounter any issues:
1. Check that both environment variables are correctly set in Settings → Vars
2. Refresh the browser (Ctrl+R or Cmd+R)
3. Make sure your Supabase project is active and not paused
4. Check the browser console (F12) for error messages

## Database Schema

The app automatically creates these tables in your Supabase database:
- `profiles`: User profile information
- `user_progress`: Tracks scores and completion status for each module
- `user_responses`: Individual question answers
- `negotiation_history`: Conversation history for AI negotiation module

All data is protected with Row Level Security (RLS) policies ensuring users can only access their own data.
