# AI-Mentor: Bank Training Simulator

Roleplay trainer for Turonbank employees. The app lets bank staff practice client communication scenarios with a virtual client powered by Anthropic Claude, then receives structured AI feedback with scores.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Anthropic Messages API with `claude-sonnet-4-20250514`
- Frontend-only state with session history in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file based on `.env.example`:

```bash
VITE_ANTHROPIC_API_KEY=your_key_here
```

Restart the dev server after changing `.env`.

## Anthropic API key

1. Create or sign in to your Anthropic Console account.
2. Open the API keys section.
3. Create a key and paste it into `.env` as `VITE_ANTHROPIC_API_KEY`.

This app calls Anthropic directly from the browser for hackathon-style simplicity. That means the API key is exposed to anyone who can inspect the frontend bundle, so this approach is not suitable for production. A production version should proxy requests through a backend.
"# ai-mentor" 
