# SRB-MNE--RU-Trainee

A small React + TypeScript web application for Russian speakers to practice Serbian/Montenegrin vocabulary.

## Features
- Multiple training modes: multiple choice, RU↔SR typing, true/false, scramble, and audio pronunciation.
- Adaptive difficulty with XP, levels and streak tracking.
- Local dictionary storage with import/export and CSV import.
- Built with Vite, Tailwind CSS and shadcn/ui components.

## Project Structure
```
src/
  App.tsx            # main application component
  components/        # reusable UI pieces (ConfettiBurst, forms, etc.)
  data/seedWords.ts  # starter vocabulary list
  types.ts           # shared TypeScript types
  utils.ts           # helpers for storage and math
```

## Development
1. Install dependencies (requires Node.js):
   ```bash
   npm install
   ```
2. Start a development server:
   ```bash
   npm run dev
   ```
3. Run tests or other checks before committing:
   ```bash
   npm test
   ```

## Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
   This generates static files in `dist/`.
2. Publish to GitHub Pages:
   ```bash
   npm install --save-dev gh-pages
   ```
   Add a script in `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
   Then run:
   ```bash
   npm run deploy
   ```
   In your repository settings, enable Pages for the `gh-pages` branch.
3. Your app will be available at `https://<username>.github.io/<repo>/`.

## License
Distributed under the MIT License. See `LICENSE` for details.
