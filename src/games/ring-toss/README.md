# Ring Toss

Land rings on the necks of the bottles at the back of the booth.

## How to play

- Move the mouse to aim, and click to toss a ring. The crosshair sways from
  side to side, up to 40 px either way, and the ring lands where the crosshair
  is when you click.
- One ring flies at a time: you can toss the next once the last has landed.
- You have 8 rings. The round ends when the last ring has landed.
- Click again on the game over screen to play another round.

## Scoring

A ring scores when it lands on a bottle's neck. The bottles stand in three rows
of five, and bottles further back are smaller and score more:

| Row    | Points |
| ------ | ------ |
| Back   | 30     |
| Middle | 20     |
| Front  | 10     |

A ring that misses scores nothing. Your final score is saved to the carnival's
score board when the round ends.

## Files

- `game.ts`: the game logic (`createState`, `toss`, `step`, `bottleAt`, `swayAt`)
  and the `ringToss` entry, the default export the midway finds.
- `game.test.ts`: tests for the game logic.
