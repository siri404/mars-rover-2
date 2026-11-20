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

## Decisions and trade-offs

### Language and tooling
TypeScript, because it's part of your stack and the type system does useful work here: directions and commands are literal union types, so the simulation can't receive a value it doesn't know how to handle. Vitest for tests, since it runs TypeScript directly with no extra config, and tsx to run the program without a build step. No runtime dependencies.

### Error handling
Any malformed input throws a single `Malformed input` error and the whole run stops; nothing is printed for earlier robots. I chose to reject the entire file rather than skip bad robots, because a partially processed file is easy to misread as a complete result. The trade-off is that the error doesn't say which line is wrong (see "With more time").

Rejected input includes: non-integer, negative or > 50 coordinates, a robot starting outside the grid, unknown directions or instructions (including lowercase), and a robot with no instruction line. Blank lines and trailing newlines are tolerated.

### Adding new commands
Commands live in a single `commands` map from letter to handler. Adding one (say `B` for back) means adding one entry: the `Command` type, the input validation and the dispatch all derive from that map, so nothing else needs to change. I deliberately didn't build a plugin system or command classes; a map is enough to keep the door open.

### Assumptions
- A lost robot reports its last position on the grid, and stops processing further instructions.
- The upper-right coordinate is part of the grid (a `5 3` grid allows x = 5, y = 3).
- Values on a line are separated by single spaces.

### With more time
- Specific error messages with line numbers (e.g. `Line 4: invalid direction "Q"`), and catching errors in `index.ts` to print the message and exit with a non-zero code instead of a stack trace.
- Enforce the 100-character instruction limit, and accept any whitespace between values, as the brief allows.
- Have the simulation return output lines instead of calling `console.log`, so it's a pure function and tests don't need to spy on the console.
