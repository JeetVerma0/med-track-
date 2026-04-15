# Med Track

Med Track is a health tracking web app built with **React + Vite** and **Firebase**.
It helps users log health episodes, add continuation updates over time, and export complete episode history as a PDF report.

## Features

- Email/password authentication (Firebase Auth)
- Profile completion gate before dashboard access
- Create one active health episode at a time
- Add continuation updates (symptoms, medicines, doctor notes, prescription image)
- Mark episodes as completed and retain full timeline history
- Download episode report as PDF

## Tech Stack

- React
- Vite
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- jsPDF

## Project Structure

```text
src/
  components/    # Shared UI and route guards
  hooks/         # Reusable React hooks
  pages/         # Route-level pages
  services/      # Firebase and data access helpers
  utils/         # Formatting, PDF, and state helpers
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Fill `.env` using your Firebase project web config.

4. Start development server:

```bash
npm run dev
```

## Environment Variables

This project uses:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

You can use `.env.example` as the template.

## Quality Checks

Run before pushing:

```bash
npm run lint
npm run build
```

## Notes and Limitations

- Only one active episode is allowed per user at a time.
- This is a client-side app and expects secure Firebase rules in your backend project.
- Bundle size optimization and automated tests can be added as future improvements.
