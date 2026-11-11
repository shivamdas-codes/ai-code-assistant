# DevMate — AI Code Companion

DevMate is a responsive AI-powered coding companion built with React and Vite. It helps developers review code, debug issues, understand unfamiliar code, and generate unit tests.

## Features

- Four assistant workflows: code review, debugging, code explanation, and test generation
- Editable code workspace with language selector
- Optional context field to provide project-specific information
- Demo responses available without an API key
- Optional live integration with the Gemini API
- Copy assistant output
- Responsive desktop and mobile layouts
- No API key is bundled in the source code

## Tech stack

- React 18
- Vite
- CSS
- Lucide React icons
- Google Gemini API (optional)

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Enable live AI

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Run the app and click **Configure API key**.
3. Paste your key. The key is kept in page memory for the current session only.
4. Paste code, select a task, and click the assistant button.

The app uses the Gemini REST API from the browser for this learning prototype. Browser-side API keys can be inspected by users and should not be used for a public production deployment. For production, create a backend endpoint, store the key in a server-side environment variable, add authentication and rate limits, and call Gemini from the server. Never commit a real API key to GitHub.

## Build for production

```bash
npm run build
npm run preview
```

## Suggested GitHub repository description

`A responsive AI coding companion built with React, Vite, and Gemini API. Supports code review, debugging, explanations, and unit-test generation.`

## Important

This is a portfolio learning project, not a substitute for human code review. Always verify AI-generated suggestions and tests before using them in real applications.
