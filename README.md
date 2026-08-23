# UNO Companion App

A twist on UNO built for playing with friends and family — no physical deck required, and no ads.

## The idea

Each player's hand lives on their own phone. A tablet placed in the middle of the table displays the discard pile in real time, so everyone can see exactly what's playable — no more "wait, was that actually a valid move?" arguments. It also works as a backup whenever someone forgets to bring the physical cards.

This is a personal project for playing with friends and family — not intended to be published or shipped publicly.

## Features

- Phone-as-hand gameplay, tablet-as-shared-table display
- Real-time sync across all connected devices
- Full base UNO ruleset (Skip, Reverse, Draw Two, Wild, Wild Draw Four)
- Smooth card animations (deal, flip, turn indicator)
- No ads

## Tech stack

- **Frontend:** React (Vite)
- **Realtime sync:** Firebase Realtime DB or Supabase *(not finalized yet)*
- **Animation:** Rive, via `@rive-app/react-canvas`

## Status

React + Vite scaffold is set up. Core game logic and realtime sync are in progress — see the Feature Checklist in the project's Notion DevLog for current progress.

## Getting started

```bash
npm install
npm run dev
```

## Docs

Full architecture notes, data model, and the base rules flowchart live in the project's Notion DevLog.