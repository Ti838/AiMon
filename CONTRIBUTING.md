# Contributing Guide

Thank you for contributing to AiMon.

## Branching

- Use short-lived feature branches.
- Branch naming examples:
  - feat/live-auto-detect
  - fix/openrouter-catalog
  - docs/srs-update

## Commit Convention

Use clear prefixes:

- feat: new feature
- fix: bug fix
- docs: documentation change
- refactor: code cleanup without behavior change
- chore: maintenance task

Examples:

- feat: add auto model detection for live test
- fix: handle duplicate function declaration in live page
- docs: add API reference and capabilities notes

## Pull Request Checklist

- Ensure build passes locally.
- Ensure lint passes locally.
- Keep PR focused and scoped.
- Include screenshots for UI changes when possible.
- Update docs for behavior or architecture changes.

## Local Validation

Run before opening PR:

```bash
npm ci
npm run lint
npm run build
```

## CI Expectations

GitHub Actions runs lint/build across Linux, Windows, and macOS.
PRs should not be merged if CI is failing.

## Coding Notes

- Keep changes minimal and targeted.
- Preserve existing style and patterns.
- Avoid committing secrets.

## Reporting Issues

When reporting a bug, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Console/network error details if available
