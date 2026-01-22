# Knowledge Reset Chat

Conversational AI interface for the Knowledge Reset platform.

## Features

- **Multi-LLM Support**: Switch between GPT-4o, Claude Sonnet, and Gemini 2.0
- **Knowledge Base Integration**: Searches documentation via GraphQL API
- **Premium Dark Theme**: Modern UI with smooth animations
- **Streaming Responses**: Real-time message streaming using AI SDK

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|:---------|:------------|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o) |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google API key (Gemini) |
| `NEXT_PUBLIC_API_URL` | Knowledge Reset GraphQL API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Then add environment variables in the Vercel dashboard.

## Architecture

```
chat/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts  # Multi-LLM chat endpoint
│   │   ├── page.tsx           # Chat interface
│   │   ├── layout.tsx
│   │   ├── globals.css        # Dark theme
│   │   └── chat.module.css    # Chat styles
│   └── lib/
│       └── api.ts             # GraphQL client
```
