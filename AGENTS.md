# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal website (collinpfeifer.dev). Recently migrated from Vite + React to Astro.

## Commands

- `bun dev` - dev server at localhost:4321
- `bun build` - production build to `./dist/`
- `bun preview` - preview production build locally
- `bun lint` - run lint checks
- `bun format` - format the codebase

No automated test commands configured.

## Stack

- **Framework**: Astro 5 (static site generator)
- **UI**: Astro components and standard web platform features
- **Package manager**: bun
- **TypeScript**: enabled with a strict configuration

## Architecture

Standard Astro project layout:
- `src/pages/` - file-based routing (`.astro` files)
- `src/layouts/` - page wrapper components (`Layout.astro` provides HTML shell)
- `src/components/` - reusable components (`.astro` for static, `.tsx` for SolidJS interactive)
- `src/assets/` - images/SVGs processed by Astro's asset pipeline
- `public/` - static files served as-is (favicons)
