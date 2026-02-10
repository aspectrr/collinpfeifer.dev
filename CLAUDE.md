# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website (collinpfeifer.dev). Recently migrated from Vite + React to Astro with SolidJS integration.

## Commands

- `bun dev` - dev server at localhost:4321
- `bun build` - production build to `./dist/`
- `bun preview` - preview production build locally

No test or lint commands configured.

## Stack

- **Framework**: Astro 5 (static site generator)
- **UI library**: SolidJS (via `@astrojs/solid-js` integration)
- **Package manager**: bun
- **TypeScript**: strict mode, JSX set to `preserve` with `solid-js` import source

## Architecture

Standard Astro project layout:
- `src/pages/` - file-based routing (`.astro` files)
- `src/layouts/` - page wrapper components (`Layout.astro` provides HTML shell)
- `src/components/` - reusable components (`.astro` for static, `.tsx` for SolidJS interactive)
- `src/assets/` - images/SVGs processed by Astro's asset pipeline
- `public/` - static files served as-is (favicons)
