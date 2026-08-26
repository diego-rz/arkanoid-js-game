# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Este es un repositorio de aprendizaje. **Responde siempre en español**, tanto en la conversación como en el contenido que se escriba en `specs/` (los `/spec` de este repo ya soportan estados en español como `Aprobado`/`Implementado`). El código, nombres de variables/funciones y comentarios técnicos pueden seguir en inglés salvo que se indique lo contrario.

## Current state of this repo

This is a **pre-code bootstrap** for an Arkanoid/Breakout-style game (per `README.md`: "Juego de Arkanoid", in Spanish). As of now:

- **Target stack is decided but unbuilt**: plain HTML, CSS, and JavaScript, with **no dependencies**, playable in the browser. No framework, no bundler, no package manager expected.
- There is no source code yet — no `package.json`, no build tooling, no game logic. The project has not been scaffolded.
- Git is initialized, tracking `origin` at `github.com/diego-rz/arkanoid-js-game`, branch `main`.
- `assets/spritesheet-breakout.png` is the only game asset present so far (bricks in 6 colors, paddle segments, ball — credited to Petraheim in the sheet itself).
- `specs/01-mvp-arkanoid.md` exists in **`Borrador` (Draft)** state — it is not yet approved, so `/spec-impl` will refuse to implement it until a human flips its status to `Aprobado`. See **Planned architecture** below for what it defines.

Because no code exists yet, there are no build/lint/test commands to run. Given the "no dependencies" constraint, expect development to stay commandless (open `index.html` directly or serve statically) rather than growing an npm toolchain — don't introduce a build step or package manager unless a spec explicitly calls for it. Once code exists, this file should be updated with actual run/test commands and any architecture that diverges from the plan below.

## Planned architecture (per `specs/01-mvp-arkanoid.md`)

This is what SPEC 01 commits to building — not yet implemented, but the contract for the next `/spec-impl` run:

- Three files at the repo root: `index.html`, `style.css`, `script.js`. Canvas 2D API, fixed 800x600 canvas, no responsive design.
- Single global state object: `{ screen: 'start'|'playing', score, lives, paddle: {x,y,width,height,speed}, ball: {x,y,dx,dy,radius}, bricks: [{x,y,width,height,color,alive}] }`.
- Brick grid is fixed: 6 rows (one per spritesheet color) x 10 columns = 60 bricks, single hit each, uniform score value.
- Paddle: ← → keyboard only. Ball: constant speed, simple mirror-reflection bounce (no angle-by-impact-point physics), auto-serves on start and after each life lost.
- 3 lives; losing all 3 or clearing all 60 bricks both return straight to the `start` screen (score/lives/bricks reset) — no separate Game Over/Victory screens.
- Explicitly out of scope for this spec: power-ups, sound, pause, persistence/high-scores, multiple levels, per-color scoring, mouse/touch controls, multi-hit bricks.

## Spec-driven workflow

This repo uses a two-command spec-driven development process (installed as skills via `skills-lock.json`, sourced from `Klerith/fernando-skills`). **Both commands are user-invoked slash commands, not something to run unprompted.**

### `/spec <description>` — design a spec

- Interviews the user in question blocks (never skips clarification) and writes the result to `specs/NN-slug.md`, numbered sequentially (next one is `02-`).
- New specs start in `Draft` state (`Borrador` in this repo — see Language note above). Only a human promotes a spec to `Approved`/`Aprobado`.
- Full section structure and rules live in `.agents/skills/spec/template.md` — read it before authoring or editing a spec by hand.
- `specs/.spec-config.yml` already exists with `AutoCreateBranch: true` — leave it untouched unless the user asks to change it.

### `/spec-impl <NN-slug>` — implement an approved spec

- Refuses to proceed unless the target spec's status line means "Approved" (checked language-agnostically — English/Spanish/Portuguese/French/German/Italian equivalents all count).
- Creates and switches to a branch named `spec-NN-slug` (skippable via `AutoCreateBranch: false` in `specs/.spec-config.yml`).
- Implements the plan **one step at a time**, pausing for review after each step. Never commits automatically — commits are the user's call.
- If it hits an ambiguity the spec doesn't resolve, it stops and asks rather than improvising.

### Working within this system

- Full skill definitions live in `.agents/skills/spec/SKILL.md` and `.agents/skills/spec-impl/SKILL.md` (mirrored under `.claude/skills/`). Read them for exact phase-by-phase behavior before modifying a spec or driving implementation manually.
- Spec status values are the state machine: `Draft` → `In review` → `Approved` → `Implemented` (or `Obsolete`). Don't advance a spec's status on the user's behalf except where a skill phase explicitly says to (e.g. marking `Implemented` after acceptance criteria pass — still requires telling the user, not silently editing).
- Out-of-scope requests during implementation get deferred to a future spec, not slipped into the current branch.
