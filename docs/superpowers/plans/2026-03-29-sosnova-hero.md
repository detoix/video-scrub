# Sosnova Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new isolated `sosnova/` page that shows a masked house hotspot over a still hero, crossfades into `sosnova-reversed.mp4` on click, and plays the same video backward back to the master plan on back-arrow click.

**Architecture:** Keep the existing root page untouched. Add a dedicated hero controller module in `sosnova/` to manage forward/detail/reverse states and derive UI visibility rules, then wire that module into a standalone static page with layered stills, video, and an inline editable SVG path string.

**Tech Stack:** Static HTML, CSS, browser JavaScript modules, Node test runner

---

### Task 1: Controller Behavior

**Files:**
- Create: `sosnova/hero-controller.js`
- Test: `sosnova/hero-controller.test.mjs`

- [ ] Step 1: Write failing tests for the forward and reverse state transitions.
- [ ] Step 2: Run `node --test sosnova/hero-controller.test.mjs` and verify the tests fail for missing module behavior.
- [ ] Step 3: Implement the minimal controller to pass the tests.
- [ ] Step 4: Run `node --test sosnova/hero-controller.test.mjs` and verify all tests pass.

### Task 2: Standalone Page

**Files:**
- Create: `sosnova/index.html`
- Modify: `sosnova/hero-controller.js`

- [ ] Step 1: Build the isolated page with layered stills, video, inline editable SVG path, hover highlight, and back arrow.
- [ ] Step 2: Wire the page to preload the video, crossfade from the start still into the video over `250ms`, play forward to the end, and reverse back to the start with the end still visible during the reverse blend window.
- [ ] Step 3: Keep the root `index.html` and shared sampler untouched.

### Task 3: Verification

**Files:**
- Test: `sosnova/hero-controller.test.mjs`
- Test: `scrub-controller.test.mjs`

- [ ] Step 1: Run `node --test sosnova/hero-controller.test.mjs`.
- [ ] Step 2: Run `node --test scrub-controller.test.mjs sosnova/hero-controller.test.mjs`.
- [ ] Step 3: Open the new page locally and verify the visible states manually if browser access is available.

### Task 4: Multi-House Scene Selection

**Files:**
- Modify: `sosnova/hero-controller.js`
- Modify: `sosnova/hero-controller.test.mjs`
- Modify: `sosnova/index.html`
- Test: `sosnova/reverse-playback.test.mjs`

- [ ] Step 1: Write the failing controller test that selects a specific house scene and preserves it through forward/detail/reverse.
- [ ] Step 2: Run `node --test sosnova/hero-controller.test.mjs` and verify the new test fails.
- [ ] Step 3: Extend the controller with `activeSceneId` support and keep the existing reverse-blend behavior green.
- [ ] Step 4: Update the page to render two hotspot paths, load scene-specific `videoPath` and `endStillPath`, and reuse the same back button and reverse player.
- [ ] Step 5: Run `node --test scrub-controller.test.mjs sosnova/hero-controller.test.mjs sosnova/reverse-playback.test.mjs` and verify all tests pass.

### Task 5: Graph Navigation

**Files:**
- Modify: `sosnova/hero-controller.js`
- Modify: `sosnova/hero-controller.test.mjs`
- Create: `sosnova/graph-config.js`
- Create: `sosnova/graph-config.test.mjs`
- Modify: `sosnova/index.html`

- [ ] Step 1: Write the failing controller test for `master -> house-1 -> house-2 -> back -> house-1 -> back -> master`.
- [ ] Step 2: Run `node --test sosnova/hero-controller.test.mjs` and verify the new navigation-stack test fails.
- [ ] Step 3: Implement node and connection config plus controller support for current node, pending connection, and backtracking over the last traversed connection.
- [ ] Step 4: Update the page to render outgoing hotspot masks for the current node and select forward or reverse video assets per connection.
- [ ] Step 5: Run `node --test scrub-controller.test.mjs sosnova/hero-controller.test.mjs sosnova/reverse-playback.test.mjs sosnova/graph-config.test.mjs` and verify all tests pass.
