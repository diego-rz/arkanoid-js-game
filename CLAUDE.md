# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Este es un repositorio de aprendizaje. **Responde siempre en español**, tanto en la conversación como en el contenido que se escriba en `specs/` (los `/spec` de este repo ya soportan estados en español como `Aprobado`/`Implementado`). El código, nombres de variables/funciones y comentarios técnicos pueden seguir en inglés salvo que se indique lo contrario.

## Current state of this repo

This is a **pre-code bootstrap** for an Arkanoid/Breakout-style game (per `README.md`: "Juego de Arkanoid", in Spanish). As of now:

- **Target stack is decided but unbuilt**: plain HTML, CSS, and JavaScript, with **no dependencies**, playable in the browser. No framework, no bundler, no package manager expected.
- There is no source code yet — no `package.json`, no build tooling, no game logic. The project has not been scaffolded.
- This directory is **not yet a git repository**. `/spec-impl` (see below) creates branches, so `git init` (with the user's confirmation) will be needed before that skill can run.
- `assets/spritesheet-breakout.png` is the only game asset present so far.
- There is no `specs/` folder yet — it gets created the first time `/spec` saves a spec file.

Because no code exists yet, there are no build/lint/test commands to run. Given the "no dependencies" constraint, expect development to stay commandless (open `index.html` directly or serve statically) rather than growing an npm toolchain — don't introduce a build step or package manager unless a spec explicitly calls for it. **The first real task in this repo will be running `/spec` to define the MVP.** Once code exists, this file should be updated with actual run/test commands and architecture notes.

## Spec-driven workflow

This repo uses a two-command spec-driven development process (installed as skills via `skills-lock.json`, sourced from `Klerith/fernando-skills`). **Both commands are user-invoked slash commands, not something to run unprompted.**

### `/spec <description>` — design a spec

- Interviews the user in question blocks (never skips clarification) and writes the result to `specs/NN-slug.md`, numbered sequentially.
- New specs start in `Draft` state. Only a human promotes a spec to `Approved`.
- Full section structure and rules live in `.agents/skills/spec/template.md` — read it before authoring or editing a spec by hand.
- On first use, seeds `specs/.spec-config.yml` with `AutoCreateBranch: true`.

### `/spec-impl <NN-slug>` — implement an approved spec

- Refuses to proceed unless the target spec's status line means "Approved" (checked language-agnostically — English/Spanish/Portuguese/French/German/Italian equivalents all count).
- Creates and switches to a branch named `spec-NN-slug` (skippable via `AutoCreateBranch: false` in `specs/.spec-config.yml`).
- Implements the plan **one step at a time**, pausing for review after each step. Never commits automatically — commits are the user's call.
- If it hits an ambiguity the spec doesn't resolve, it stops and asks rather than improvising.

### Working within this system

- Full skill definitions live in `.agents/skills/spec/SKILL.md` and `.agents/skills/spec-impl/SKILL.md` (mirrored under `.claude/skills/`). Read them for exact phase-by-phase behavior before modifying a spec or driving implementation manually.
- Spec status values are the state machine: `Draft` → `In review` → `Approved` → `Implemented` (or `Obsolete`). Don't advance a spec's status on the user's behalf except where a skill phase explicitly says to (e.g. marking `Implemented` after acceptance criteria pass — still requires telling the user, not silently editing).
- Out-of-scope requests during implementation get deferred to a future spec, not slipped into the current branch.
