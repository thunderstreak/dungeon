# Click Move Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace keyboard-based player movement with pure left-click movement while preserving scene-specific click routing and allowing immediate reroute on repeated clicks.

**Architecture:** Keep scene-level left-click dispatch in `TownScene` and `DungeonScene`, and simplify `Player` into a click-driven mover by removing keyboard input initialization and processing. Preserve existing movement stepping, attack targeting, UI blocking, and stop-moving behavior so the change is a focused input-model migration rather than a movement-system rewrite.

**Tech Stack:** TypeScript, Phaser, Vite, lightweight node-based tests in `src/test`

---

### Task 1: Lock behavior with movement tests

**Files:**
- Modify: `src/test/PlayerMoveAnimation.test.ts`
- Inspect: `src/entities/Player.ts`

**Step 1: Add a focused test harness for click-driven movement behavior**

Extend the existing lightweight test file or split a new test file if needed so it can assert:

- keyboard movement helpers are no longer required for movement behavior
- repeated `moveToScreen()` calls overwrite the prior target
- movement-facing data can still update correctly for click movement if that logic exists in `Player`

If the current file is too animation-specific, create a new file instead:

```ts
// src/test/PlayerClickMove.test.ts
function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
```

**Step 2: Run the focused test to verify the desired behavior is not fully covered yet**

Run: `pnpm exec tsx src/test/PlayerClickMove.test.ts`

Expected: either FAIL for missing click-only expectations or file not found before creation.

**Step 3: Write the minimal assertions around click target replacement**

Use a narrow test seam. If direct `Player` construction is too heavy, extract a tiny pure helper only if necessary, but prefer testing against existing behavior with minimal scaffolding.

Example target assertion shape:

```ts
player.moveToScreen(100, 100);
player.moveToScreen(220, 160);
assert(currentTarget.x === 220, 'Expected later click to replace previous move target');
```

**Step 4: Run the focused test and make sure it passes after implementation**

Run: `pnpm exec tsx src/test/PlayerClickMove.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/test/PlayerClickMove.test.ts src/entities/Player.ts
git commit -m "test: lock click movement behavior"
```

### Task 2: Remove keyboard movement from Player

**Files:**
- Modify: `src/entities/Player.ts`
- Test: `src/test/PlayerClickMove.test.ts`

**Step 1: Write or update a failing test that proves keyboard movement is no longer part of the movement path**

If the test seam allows it, assert that player update behavior depends on click target state rather than cursor state. If direct keyboard simulation is impractical, document this constraint in comments and verify by implementation plus scene/runtime checks.

**Step 2: Run the focused player test to confirm a failing or incomplete state before edits**

Run: `pnpm exec tsx src/test/PlayerClickMove.test.ts`

Expected: FAIL or incomplete coverage before the code change.

**Step 3: Make the minimal code change in `Player.ts`**

Apply these edits:

- remove `cursors` and `wasd` fields
- remove keyboard initialization in the constructor
- remove the `handleInput()` method
- remove the `this.handleInput(delta)` call from `update()`
- keep `handleClickMove()` and `moveToScreen()` behavior intact
- ensure click-based stepping still updates `facingDirection` correctly if needed for animation

Implementation target shape:

```ts
update(delta: number): void {
  this.combatEntity.buffManager.update(delta / 1000);
  this.handleClickMove(delta);
  this.handleAutoAttack(delta);
  // ...rest unchanged
}
```

**Step 4: Run the focused test to verify the click-only movement logic passes**

Run: `pnpm exec tsx src/test/PlayerClickMove.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/entities/Player.ts src/test/PlayerClickMove.test.ts
git commit -m "refactor: make player movement click-only"
```

### Task 3: Verify scene routing still matches the new model

**Files:**
- Modify if needed: `src/scenes/TownScene.ts`
- Modify if needed: `src/scenes/DungeonScene.ts`
- Inspect: `src/scenes/UIScene.ts`

**Step 1: Review town click routing against the new contract**

Check that town still:

- ignores movement clicks when UI panels are open
- sends camera-adjusted coordinates into `moveToScreen()`

No code change unless behavior is inconsistent.

**Step 2: Review dungeon click routing against the new contract**

Check that dungeon still:

- gives priority to clicking monsters
- only sends ground clicks into `moveToScreen()`
- does not accidentally move while dead

**Step 3: Apply minimal fixes only if a scene violates the agreed behavior**

Example shape if needed:

```ts
if (!clickedMonster) {
  this.player.moveToScreen(pointer.x, pointer.y);
}
```

**Step 4: Run file-level diagnostics and any targeted checks**

Run LSP diagnostics on:

- `src/entities/Player.ts`
- `src/scenes/TownScene.ts`
- `src/scenes/DungeonScene.ts`

Expected: zero errors

**Step 5: Commit**

```bash
git add src/scenes/TownScene.ts src/scenes/DungeonScene.ts
git commit -m "fix: align scene click routing with click movement"
```

### Task 4: Run verification for the whole change

**Files:**
- Verify: `src/entities/Player.ts`
- Verify: `src/scenes/TownScene.ts`
- Verify: `src/scenes/DungeonScene.ts`
- Verify: `src/test/PlayerClickMove.test.ts`

**Step 1: Run targeted tests**

Run:

```bash
pnpm exec tsx src/test/PlayerMoveAnimation.test.ts
pnpm exec tsx src/test/PlayerClickMove.test.ts
```

Expected: both PASS

**Step 2: Run type-aware diagnostics**

Use workspace diagnostics or run:

```bash
pnpm exec tsc --noEmit
```

Expected: exit 0

**Step 3: Run the app for manual verification**

Run:

```bash
pnpm dev
```

Then verify manually:

- town: keyboard does not move
- town: left-click ground moves player
- town: repeated clicks reroute immediately
- town: open UI panel blocks movement click
- dungeon: keyboard does not move
- dungeon: left-click ground moves player
- dungeon: repeated clicks reroute immediately
- dungeon: clicking monster selects / attacks instead of moving

**Step 4: Record any pre-existing unrelated issues separately**

Do not widen scope. Only fix regressions introduced by this change.

**Step 5: Commit**

```bash
git add src/entities/Player.ts src/scenes/TownScene.ts src/scenes/DungeonScene.ts src/test/PlayerClickMove.test.ts
git commit -m "feat: switch player movement to left-click"
```
