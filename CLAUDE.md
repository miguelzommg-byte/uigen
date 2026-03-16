# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests with Vitest
npm run db:reset     # Reset database (destructive)
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Architecture

UIGen is a Next.js 15 app (App Router) where users chat with Claude to generate React components that are previewed live in the browser.

### Key data flow

1. **User sends message** → `ChatContext` (`src/lib/contexts/chat-context.tsx`) calls `/api/chat` via Vercel AI SDK `useChat`
2. **API route** (`src/app/api/chat/route.ts`) streams a response using `streamText` with two tools:
   - `str_replace_editor` — create/edit files (view, create, str_replace, insert commands)
   - `file_manager` — rename/delete files
3. **Tool calls are intercepted client-side** by `FileSystemContext.handleToolCall` which mutates the in-memory `VirtualFileSystem`
4. **Preview updates** automatically as `refreshTrigger` increments — `PreviewFrame` compiles the VFS files with Babel (`@babel/standalone`), creates blob URLs, injects an import map into a sandboxed iframe

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is a pure in-memory tree structure — no disk I/O. Files are serialized to JSON for:
- Sending to the API on every request (`fileSystem.serialize()` in request body)
- Persisting to the SQLite `Project.data` column for authenticated users

The API reconstructs the VFS from the serialized payload each request via `deserializeFromNodes`.

### AI Provider

`src/lib/provider.ts` exports `getLanguageModel()`:
- With `ANTHROPIC_API_KEY` set → uses `claude-haiku-4-5` via `@ai-sdk/anthropic`
- Without API key → returns `MockLanguageModel` which generates static counter/form/card components

The system prompt (`src/lib/prompts/generation.tsx`) instructs the model to always create `/App.jsx` as the root entrypoint and use `@/` import aliases for local files.

### Preview pipeline

`src/lib/transform/jsx-transformer.ts`:
- Transforms JSX/TSX with Babel standalone in the browser
- Builds an ES module import map: local files → blob URLs, third-party packages → `esm.sh` CDN
- Missing local imports get placeholder stub modules
- CSS files are inlined as `<style>` tags
- The iframe uses Tailwind CSS from CDN

### Authentication

JWT-based auth stored in an httpOnly cookie (`auth-token`). `src/lib/auth.ts` is server-only. Anonymous users can still use the app — their work is tracked in `src/lib/anon-work-tracker.ts` (localStorage) and can be claimed on sign-up.

### Routing

- `/` — main page, anonymous session
- `/[projectId]` — loads a saved project for authenticated users
- `/api/chat` — streaming chat endpoint (no auth required; project saving requires auth)
- `/api/projects`, `/api/filesystem` — protected by middleware JWT check

### Database

Prisma with SQLite (`prisma/dev.db`). Two models:
- `User` — email + bcrypt password
- `Project` — `messages` (JSON array) + `data` (serialized VFS JSON), optionally linked to a user

After schema changes: `npx prisma migrate dev` then `npx prisma generate`.

### UI components

`src/components/ui/` contains shadcn/ui primitives (Radix UI based). The main layout is a resizable panel split: chat on the left, preview/code editor tabs on the right.
