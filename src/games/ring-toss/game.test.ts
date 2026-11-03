import { describe, expect, it } from 'vitest';
import {
  FLIGHT_TIME,
  NECK_RADIUS,
  RINGS_PER_ROUND,
  SWAY,
  THROWER,
  bottleAt,
  createState,
  ringPosition,
  step,
  swayAt,
  toss,
  type Bottle,
} from './game';

/** Throws a ring that lands exactly on (x, y), with no sway. */
function tossAt(state: ReturnType<typeof createState>, x: number, y: number) {
  state.time = 0;
  expect(toss(state, x, y)).toBe(true);
  step(state, FLIGHT_TIME);
}

describe('ring toss', () => {
  it('starts with every ring in hand and no score', () => {
    const state = createState();
    expect(state.rings).toBe(RINGS_PER_ROUND);
    expect(state.score).toBe(0);
    expect(state.ring).toBeNull();
    expect(state.phase).toBe('playing');
    expect(state.bottles).toHaveLength(15);
  });

  it('uses one ring per toss', () => {
    const state = createState();
    expect(toss(state, 400, 200)).toBe(true);
    expect(state.rings).toBe(RINGS_PER_ROUND - 1);
    expect(state.ring).not.toBeNull();
  });

  it('throws one ring at a time', () => {
    const state = createState();
    toss(state, 400, 200);
    expect(toss(state, 400, 200)).toBe(false);
    expect(state.rings).toBe(RINGS_PER_ROUND - 1);
  });

  it('cannot toss once the rings run out', () => {
    const state = createState();
    state.rings = 0;
    expect(toss(state, 400, 200)).toBe(false);
    expect(state.ring).toBeNull();
  });

  it('scores a ring that lands on a bottle neck', () => {
    const state = createState();
    const bottle = state.bottles[0];
    tossAt(state, bottle.x, bottle.y);
    expect(state.score).toBe(bottle.points);
    expect(state.landed).toEqual([{ x: bottle.x, y: bottle.y, scored: true }]);
  });

  it('scores nothing for a ring that misses', () => {
    const state = createState();
    tossAt(state, 5, 460);
    expect(state.score).toBe(0);
    expect(state.landed[0].scored).toBe(false);
  });

  it('scores bottles further back higher', () => {
    const state = createState();
    const back = state.bottles.reduce((a, b) => (b.y < a.y ? b : a));
    const front = state.bottles.reduce((a, b) => (b.y > a.y ? b : a));
    expect(back.points).toBeGreaterThan(front.points);
  });

  it('keeps the ring in the air until it lands', () => {
    const state = createState();
    const bottle = state.bottles[0];
    state.time = 0;
    toss(state, bottle.x, bottle.y);
    step(state, FLIGHT_TIME / 2);
    expect(state.ring).not.toBeNull();
    expect(state.score).toBe(0);
  });

  it('ends the round when the last ring has landed', () => {
    const state = createState();
    state.rings = 1;
    tossAt(state, 400, 200);
    expect(state.rings).toBe(0);
    expect(state.phase).toBe('over');
  });

  it('keeps playing while the last ring is in the air', () => {
    const state = createState();
    state.rings = 1;
    toss(state, 400, 200);
    step(state, FLIGHT_TIME / 2);
    expect(state.phase).toBe('playing');
  });

  it('sways the throw sideways over time, never more than the sway', () => {
    expect(swayAt(0)).toBe(0);
    for (let t = 0; t < 5; t += 0.1) expect(Math.abs(swayAt(t))).toBeLessThanOrEqual(SWAY);
    const state = createState();
    state.time = 0.5;
    toss(state, 400, 200);
    expect(state.ring?.toX).toBeCloseTo(400 + swayAt(0.5));
  });

  it('never throws a ring backwards, even when aimed below the thrower', () => {
    const state = createState();
    toss(state, 400, THROWER.y + 100);
    expect(state.ring?.toY).toBeLessThan(THROWER.y);
  });

  it('flies from the thrower to where the ring lands', () => {
    const ring = { fromX: 400, fromY: 470, toX: 100, toY: 120, age: 0 };
    expect(ringPosition(ring)).toEqual({ x: 400, y: 470 });
    const end = ringPosition({ ...ring, age: FLIGHT_TIME });
    expect(end.x).toBeCloseTo(100);
    expect(end.y).toBeCloseTo(120);
  });

  it('finds the bottle under a ring only near its neck', () => {
    const bottle: Bottle = { x: 400, y: 200, points: 20, scale: 1 };
    expect(bottleAt([bottle], 400 + NECK_RADIUS - 1, 200)).toBe(bottle);
    expect(bottleAt([bottle], 400 + NECK_RADIUS + 1, 200)).toBeUndefined();
  });
});
