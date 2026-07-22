# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## ⚠️ Current state: bare scaffold

As of this writing, the repository contains **no application source code**. The
only tracked files are `.gitignore` and this document. The project name and the
`.gitignore` template reveal the intended stack, but nothing has been
implemented yet.

**Do not describe features, files, or modules that do not exist.** When you add
code, update this file so it always reflects the real state of the tree. If you
are asked to "explain the codebase" and it is still empty, say so.

## What this project is meant to be

`gemini-rag-app` is intended to be a **Retrieval-Augmented Generation (RAG)**
web application built on **Next.js** and backed by **Google Gemini** models.

The intended stack, inferred from the `.gitignore` (Next.js, Vercel,
TypeScript, and `.env` entries):

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **LLM provider:** Google Gemini (via the Google Generative AI / `@google/genai` SDK)
- **Deployment target:** Vercel
- **Secrets:** provided through `.env` / `.env*.local` (git-ignored — never commit them)

> Note: framework, package manager, vector store, and embedding provider are
> **not yet fixed by any committed code.** The list above is the design intent,
> not established fact. Confirm choices with the repository owner before scaffolding,
> and update this section once `package.json` lands.

## Repository layout

```
.
├── .gitignore     # Next.js / TypeScript / Vercel ignore template
└── CLAUDE.md      # this file
```

Once the app is scaffolded, a conventional Next.js RAG layout would look
roughly like this (record the actual layout here as it is created):

```
app/ or pages/     # Next.js routes and API handlers
  api/             # server routes: ingestion, retrieval, chat/completion
components/         # React UI components
lib/               # RAG core: chunking, embeddings, retrieval, Gemini client
public/            # static assets
```

## Development workflow

No toolchain is committed yet, so there are no build/test/lint commands to run.
When the Next.js app is scaffolded, the standard commands will be (verify
against `package.json` before relying on them):

```bash
# install dependencies (use whichever lockfile is committed)
npm install            # or: pnpm install / yarn install

npm run dev            # start the local dev server (Next.js, default :3000)
npm run build          # production build
npm run start          # serve the production build
npm run lint           # ESLint (next lint)
```

**Before assuming any command exists, read `package.json` `scripts`.** Keep the
list above in sync with what is actually defined there.

## Conventions

- **Secrets & config:** All API keys (e.g. the Gemini API key) belong in
  `.env.local` and must never be committed. The `.gitignore` already excludes
  `.env` and `.env*.local`. When you introduce a new environment variable,
  document it here and add it to an `.env.example` with a placeholder value.
- **TypeScript:** The project targets TypeScript. Prefer typed code and match
  the compiler settings in `tsconfig.json` once it exists.
- **Match surrounding code:** Once source exists, follow its existing naming,
  formatting, and import conventions rather than importing new ones.

## Git & branch conventions

- The default branch is `main`.
- Active development for the current task happens on
  `claude/claude-md-docs-95dx5v`.
- Write clear, descriptive commit messages.
- **Do not open a pull request unless explicitly asked.**

## Notes for AI assistants

- This file is the source of truth for project structure and workflow. **Keep it
  accurate** — update it in the same change that alters structure, tooling, or
  conventions.
- Prefer honesty about the empty/early state over plausible-sounding
  fabrication. If a requested file or command doesn't exist yet, say so and
  offer to scaffold it.
- Keep secrets out of the repo, out of commits, and out of any published
  output.
