---
name: review-carnival-house-rules
description: Review a change to a carnival game under src/games/ against house rules 1 to 3 in AGENTS.md - every game registers on the midway, reports scores through recordScore from src/carnival, and draws with theme and canvasFont. Use when reviewing a new or changed game in the Tessl Carnival.
---

# Review lens: Carnival House Rules

Review whether a changed game under `src/games/` keeps house rules 1 to 3 in `AGENTS.md`, so it shows up on the midway, its scores land on the shared board, and it looks like every other booth.

## Scope

- **Registration (house rule 1)** A game lives in `src/games/<game-id>/`, its `game.ts` has its `CarnivalGame` as the default export, and the game's `id` matches its folder name. `src/games/index.ts` finds every `src/games/*/game.ts` by itself, so a game needs no edit to `src/games/index.ts`, `src/main.ts` or `src/midway/` to get its booth.
- **Scores (house rule 2)** A game calls `recordScore(game.id, score)` from `src/carnival` once, when a round ends. It does not touch `localStorage` or `sessionStorage`, keep its own high score table, or record scores under any id but its own.
- **Theme (house rule 3)** Colours, fonts and sizes come from `theme` and `canvasFont` in `src/carnival/theme.ts`. A game has no hex, `rgb()`, `hsl()` or named CSS colour literals, and no font strings such as `'bold 24px sans-serif'`.

Out of scope:

- Code outside `src/games/`. `src/carnival/` defines the theme and the scores module, so its literals and storage access are the point of it. `src/midway/palette.ts` has its own scenery colours by design.
- Values derived from the theme: `theme.colors.accent`, `theme.canvas.width / 2`, `theme.font.body * 1.5`, a colour or size built from a theme value.
- Test data in `game.test.ts`: literal scores, colours or fonts there are fixtures, not drawing.
- Anything lint, the type-checker or the tests already enforce. `npm run check` runs all three in CI, so a reviewer repeating them adds noise. In particular, `src/games/index.test.ts` loads every game folder, so a `game.ts` with no default export, or an `id` that differs from its folder name, already fails the tests.
- House rules 4 to 7 and general code quality. Other lenses cover those.

## Method

Read house rules 1 to 3 in `AGENTS.md` first, and `src/games/index.ts`, `src/carnival/index.ts` and `src/carnival/theme.ts`, so findings cite what the code does today rather than what this lens remembers.

For each game folder the change touches, read its `game.ts` as a whole, not only the changed lines: a removed `recordScore` call or a new literal colour only shows against the rest of the file.

Registration: check the game is a direct child folder of `src/games/` with its own `game.ts`. A `game.ts` nested deeper, such as `src/games/arcade/hoops/game.ts`, is not found. Check the change does not register a game by hand, for example by importing it into `src/games/index.ts` or `src/main.ts`.

Scores: follow each path that ends a round (time running out, lives reaching zero, a final throw) and count the `recordScore` calls on it. Report a path with none, a path that can call it more than once for one round (a call inside the animation loop with no guard, or in both a timer and a key handler), and a call with an id other than the game's own `id`. Search the folder for `localStorage`, `sessionStorage`, `indexedDB` and `document.cookie`, and for a module-level best or top score that duplicates `bestScore` or `topScores`.

Theme: search the game's non-test files for `#` followed by three to eight hex digits, `rgb(`, `rgba(`, `hsl(`, colour names assigned to `fillStyle`, `strokeStyle`, `shadowColor` or gradient stops, and any string assigned to `ctx.font` that is not `canvasFont(...)`. Check each hit is not derived from `theme`.

## Threshold

Report a broken house rule when the change introduces it or leaves it in a game the change touches.

Be accurate about the consequence, because the review weighs it:

- A game outside a direct `src/games/<game-id>/game.ts` gets no booth: players cannot find or play it.
- A `game.ts` with no default export, or a game whose `id` differs from its folder name, makes `src/games/index.ts` throw when the midway loads, and `src/games/index.test.ts` fails. Leave these to the tests unless the change weakens that check.
- A round end with no `recordScore` call loses the player's score from the booth card and the midway's high scores. More than one call per round fills the shared board with duplicate entries.
- A game that reads or writes storage itself keeps scores the midway never shows, and can collide with the shared board's keys.
- A literal colour or font makes that booth look unlike the rest of the carnival and stops following theme changes. Nothing breaks for the player.

Do not report a rule the change does not touch in a file it does not change. Do not report `theme` access patterns as style (destructuring `theme.colors`, a local alias) when the values still come from the theme.

## Reporting

- Name the house rule by number and quote its one-line summary from `AGENTS.md`.
- Point at the line: the literal colour, the font string, the storage call, the missing or duplicated `recordScore` path.
- State what the player or the midway sees as a result, using the consequences above, and do not overstate it.
- Give the fix in the carnival's own terms: the `theme.colors` key or `canvasFont(size, weight)` call to use, where the single `recordScore(game.id, score)` belongs, or the folder the game should move to.
