# AI-Mentor: Bank Training Simulator

Roleplay trainer for Turonbank employees. The app lets bank staff practice client communication scenarios with a virtual client powered by Groq, then receives structured AI feedback with scores.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Groq OpenAI-compatible Chat Completions API with `llama-3.3-70b-versatile`
- Frontend-only state with session history in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file based on `.env.example`:

```bash
VITE_GROQ_API_KEY=your_key_here
```

Restart the dev server after changing `.env`.

## Groq API key

1. Create or sign in to GroqCloud.
2. Open the API keys section in the Groq Console.
3. Create a key and paste it into `.env` as `VITE_GROQ_API_KEY`.

This app calls Groq directly from the browser for hackathon-style simplicity. That means the API key is exposed to anyone who can inspect the frontend bundle, so this approach is not suitable for production. A production version should proxy requests through a backend.
