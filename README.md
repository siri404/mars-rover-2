# Mars Rover 2

[![CI](https://github.com/siri404/mars-rover-2/actions/workflows/ci.yml/badge.svg)](https://github.com/siri404/mars-rover-2/actions/workflows/ci.yml)

A Mars Rover simulation in TypeScript.

## Requirements

- Node.js 20 or later

## Setup

```bash
npm install
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Runs `src/index.ts` with `input.txt` |
| `npx tsx src/index.ts <file>` | Runs with a different input file |
| `npm test` | Runs the tests once (Vitest) |
| `npm run test:watch` | Re-runs the tests on every change |
| `npm run typecheck` | Type-checks without emitting files |
| `npm run build` | Compiles to `dist/` |

## Layout

- `src/index.ts`: reads the input file and passes its contents to `main`
- `src/main.ts`: `main(input)`, where the simulation goes
- `test/`: tests (`*.test.ts`)
- `input.txt`: sample input
