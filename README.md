# AI-Mentor: Bank Training Simulator

Roleplay trainer for Turonbank employees. The app lets bank staff practice client communication scenarios with a virtual client powered by Google Gemini, then receives structured AI feedback with scores.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Gemini API with `gemini-2.5-flash`
- Frontend-only state with session history in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file based on `.env.example`:

```bash
VITE_GEMINI_API_KEY=your_key_here
```

Restart the dev server after changing `.env`.

## Gemini API key

1. Create or sign in to Google AI Studio.
2. Open the API keys section.
3. Create a key and paste it into `.env` as `VITE_GEMINI_API_KEY`.

This app calls Gemini directly from the browser for hackathon-style simplicity. That means the API key is exposed to anyone who can inspect the frontend bundle, so this approach is not suitable for production. A production version should proxy requests through a backend.
"# ai-mentor" 
