# Flip 7 Scoreboard

A mobile-optimized scoreboard web app for the Flip 7 board game, built with Next.js and deployed on Vercel.

## Features

- 🎮 Create and manage scoreboards locally using localStorage
- 👥 Add multiple players using comma-delimited names
- 📊 Track scores across multiple rounds
- ❌ Mark players as "BUST" for any round
- 📱 Mobile-first, responsive design
- 💾 Automatic save/restore of game state

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the scoreboard.

## How to Use

1. **Start a Game**: Enter player names separated by commas (e.g., "Alice, Bob, Charlie")
2. **Record Scores**: For each round, enter the points each player scored
3. **Mark Busts**: Click the "BUST" button for any player who busts in a round
4. **View Progress**: The scoreboard automatically tracks total scores
5. **Reset**: Click "Reset Game" to start over

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
