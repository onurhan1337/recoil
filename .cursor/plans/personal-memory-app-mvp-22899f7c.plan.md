<!-- 22899f7c-cd58-4457-a30e-7bcaf87707fc 88666934-707d-4f7a-99ce-37fb2b6dbf40 -->
# Recoil - Phase 1 MVP

## Project Structure

```
recoil/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── api/
│   │   ├── notes/
│   │   │   ├── route.ts
│   │   │   └── search/
│   │   │       └── route.ts
│   │   └── usage/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── note-input.tsx
│   ├── search-input.tsx
│   ├── message-list.tsx
│   └── auth-button.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── embeddings.ts
│   ├── validations.ts
│   └── utils.ts
├── types/
│   └── database.ts
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## Implementation Steps

### 1. Project Setup

- Initialize Next.js 15: `npx create-next-app@latest .`
- Install core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@vercel/ai`, `zod`, `lucide-react`, `@xenova/transformers`
- Add shadcn/ui components: `npx shadcn@latest add button input textarea card`
- Configure Tailwind with fal.ai-inspired dark theme (minimal, clean design)
- Set up TypeScript strict mode

### 2. Supabase Configuration

- Create Supabase project and configure connection
- Database schema migration:
  - Enable pgvector extension
  - `notes` table: `id uuid`, `user_id uuid`, `content text`, `embedding vector(384)`, `created_at timestamp`
  - `usage` table: `user_id uuid`, `credits integer`, `last_reset timestamp`
  - RLS policies for user data isolation
- Configure Supabase Auth (email/password)
- Generate TypeScript types: `npx supabase gen types typescript --project-id <id>`

### 3. Embedding Strategy (Optimized & Cost-Effective)

- Primary: Use `@xenova/transformers` with `all-MiniLM-L6-v2` model (384 dimensions, free, fast, runs locally)
- Generate embeddings server-side in API routes
- Fallback: OpenAI `text-embedding-3-small` only if local model fails
- Store 384-dimensional vectors in pgvector column

### 4. API Routes (All with Zod Validation)

**POST `/api/notes`**

- Authenticate user via Supabase server client
- Validate request body with Zod schema (note content, length limits)
- Generate embedding using local model (primary) or OpenAI (fallback)
- Insert note + embedding into Supabase with proper types
- Decrement user credits atomically
- Return typed response

**POST `/api/notes/search`**

- Authenticate user
- Validate search query with Zod (min length, sanitization)
- Generate embedding for query
- Use pgvector cosine similarity search (`<=>` operator)
- Return top 10 similar notes with similarity scores
- Decrement user credits
- Support streaming via Vercel AI SDK

**GET `/api/usage`**

- Authenticate user
- Return current credit balance with typed response

### 5. UI Components (fal.ai Design Style)

**Main Page (`app/page.tsx`)**

- Chat-style interface with Vercel AI SDK streaming
- Unified view for writing and searching (no toggle needed)
- Dark theme with minimal design (fal.ai aesthetic)
- Credit balance display with lucide icons
- Real-time message updates

**note-input.tsx**

- Textarea component with Zod validation
- Submit button with loading state (lucide icons)
- Error handling and display
- Clean, minimal styling matching fal.ai

**search-input.tsx**

- Input field with Zod validation
- Streaming search results via Vercel AI SDK `useChat`
- Real-time result display
- Similarity score indicators
- Lucide search icon

**message-list.tsx**

- Render notes and search results in chat format
- Timestamp formatting
- Smooth animations
- Responsive layout
- Type-safe props

### 6. Credit System

- Default: 100 credits per user
- Note creation: -1 credit
- Search query: -1 credit
- Track in `usage` table with RLS policies
- Display in UI with real-time updates
- Atomic operations to prevent race conditions

### 7. Authentication Flow

- Login/signup pages with Supabase Auth
- Protected routes via Next.js middleware
- Server-side auth helpers using `@supabase/ssr`
- Type-safe auth state throughout app

### 8. Vercel AI SDK Integration

- Use `useChat` hook for streaming search results
- Stream AI-generated summaries of search results
- Real-time UI updates with proper error handling
- Type-safe streaming responses

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY= (optional, fallback only)
```

## Key Files to Create

1. `supabase/migrations/001_initial_schema.sql` - Schema with pgvector (384 dimensions)
2. `app/api/notes/route.ts` - Note creation with Zod validation
3. `app/api/notes/search/route.ts` - Semantic search with streaming
4. `app/page.tsx` - Main chat interface with Vercel AI SDK
5. `lib/embeddings.ts` - Local embedding generation (primary) + OpenAI fallback
6. `lib/validations.ts` - Zod schemas for all forms/APIs
7. `components/note-input.tsx` - Note writing component
8. `components/search-input.tsx` - Search component with streaming

## Technical Decisions

- **Embeddings**: Local `all-MiniLM-L6-v2` (384 dims) via `@xenova/transformers` - zero cost, fast, server-side
- **Vector similarity**: Cosine distance via pgvector `<=>` operator
- **Type safety**: Full TypeScript with generated Supabase types
- **Validation**: Zod schemas for all inputs (APIs, forms, UI components)
- **Streaming**: Vercel AI SDK for real-time search results and summaries
- **Design**: Dark theme, minimal, fal.ai-inspired aesthetic
- **Icons**: lucide-react only (no emojis anywhere)
- **File naming**: kebab-case throughout (e.g., `note-input.tsx`)
- **Code quality**: No comments, clean validated code, type-safe
- **Context7**: Use MCP for documentation access when needed
- **Next.js**: Version 15 (latest stable)
- **Supabase**: Latest `@supabase/supabase-js` and `@supabase/ssr`

### To-dos

- [ ] Initialize Next.js project with TypeScript, Tailwind, and install core dependencies (Supabase, OpenAI, shadcn/ui)
- [ ] Create database migration with notes table (pgvector), usage table, and RLS policies
- [ ] Configure Supabase Auth and create login/signup pages with protected routes
- [ ] Build POST /api/notes endpoint: generate embedding, store note, update credits
- [ ] Build POST /api/notes/search endpoint: vector similarity search with pgvector
- [ ] Build GET /api/usage endpoint to check user credit balance
- [ ] Create NoteInput, SearchInput, and MessageList components with shadcn/ui
- [ ] Build main chat-style page with write/search toggle and credit display