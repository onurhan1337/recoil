# Recoil

Personal knowledge management app with AI-powered semantic search and interactive knowledge graph visualization.

## Overview

Recoil helps you capture, organize, and retrieve your notes using semantic search. The app automatically generates embeddings for your notes, enabling you to find related content based on meaning rather than just keywords. An AI chat assistant can answer questions using your notes as context.

## Features

- **Semantic Search**: Find notes by meaning using vector embeddings
- **AI Chat**: Ask questions and get answers based on your notes
- **Collections**: Organize notes into logical groups
- **Note Linking**: Create manual connections or discover semantic relationships between notes
- **Reminders**: Schedule email and in-app notifications for important notes
- **Templates**: Create reusable note structures
- **Analytics**: Track note creation patterns and category distributions
- **Markdown Support**: Rich text editing with full markdown support

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- Radix UI components
- Tiptap editor

**Backend**
- Next.js API routes and Server Actions
- Supabase (PostgreSQL)
- Zod validation

**AI/ML**
- Google Gemini (primary)
- Ollama (local fallback)
- Xenova Transformers for embeddings (all-MiniLM-L6-v2)

**Services**
- Supabase Auth
- Resend (email)
- Polar.sh (subscriptions)

## Prerequisites

- Node.js 18+
- Supabase account
- Google AI API key (for Gemini)
- Resend account (for emails)
- Polar.sh account (for subscriptions)
- Ollama (optional, for local LLM fallback)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
AI_PROVIDER=auto
AI_MODEL=gemini-2.0-flash-thinking-exp-01-21
AI_FALLBACK_ENABLED=true
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# Optional: Ollama (local fallback)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Optional: OpenAI (embedding fallback)
OPENAI_API_KEY=your-openai-key

# Email
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_RESEND_FROM_EMAIL=noreply@yourdomain.com

# Subscriptions
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_WEBHOOK_SECRET=your-webhook-secret
POLAR_PRODUCT_PRICE_ID=your-price-id
POLAR_ORGANIZATION_ID=your-org-id

# App URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security
CRON_SECRET=your-cron-secret
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/onurhan1337/recoil.git
cd recoil
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

Apply migrations to your Supabase project using the Supabase CLI or dashboard.

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Database Schema

The app uses the following main tables:

| Table | Purpose |
|-------|---------|
| notes | Note storage with embeddings |
| note_links | Relationships between notes |
| collections | Note groupings |
| conversations | Chat history |
| messages | Chat messages |
| reminders | Scheduled notifications |
| notifications | In-app alerts |
| usage | Credit and subscription tracking |
| note_templates | Reusable templates |
| analyses | Analytics results |

## How It Works

### Semantic Search

1. When you create a note, the app generates a 384-dimensional embedding using the all-MiniLM-L6-v2 model
2. The embedding is stored alongside the note content
3. Search queries are converted to embeddings and compared using cosine similarity
4. Notes are ranked by semantic relevance

### AI Chat

1. Your question is converted to an embedding
2. Relevant notes are retrieved based on semantic similarity
3. The AI model receives your question along with the relevant note context
4. Responses include citations to the source notes

### Credit System

The app uses a credit-based system:

**Free Plan (500 credits/month)**
- Create note: 2 credits
- Chat message: 5 credits
- Embedding: 1 credit per 512-character chunk

**Pro Plan (10,000 credits/month)**
- Create note: 1 credit
- Chat message: 3 credits
- Embedding: Free

Pro features include unlimited templates, email reminders, analytics, and note linking.

## Project Structure

```
recoil/
├── app/
│   ├── (auth)/           # Login and signup pages
│   ├── (dashboard)/      # Protected app routes
│   └── api/              # API endpoints
├── components/
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/
│   ├── ai/               # AI provider configuration
│   ├── api/              # API utilities and hooks
│   ├── supabase/         # Database client
│   └── ...               # Other utilities
├── supabase/
│   └── migrations/       # Database migrations
└── types/                # TypeScript definitions
```

## API Endpoints

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - List notes
- `POST /api/notes/search` - Semantic search

### Chat
- `POST /api/chat` - Send message with streaming response
- `GET /api/conversations` - List conversations

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - List reminders

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linter
```

## Configuration

### AI Provider

Set `AI_PROVIDER` to control which AI model is used:

- `auto` - Uses Ollama in development, Google in production
- `google` - Always use Google Gemini
- `ollama` - Always use local Ollama

Set `AI_FALLBACK_ENABLED=true` to automatically switch providers if the primary fails.

### Cron Jobs

The app includes cron endpoints for:

- `/api/cron/check-reminders` - Process due reminders
- `/api/cron/reset-credits` - Reset monthly credits
- `/api/cron/check-subscriptions` - Check subscription status

These endpoints require the `CRON_SECRET` for authentication.

## License

MIT
