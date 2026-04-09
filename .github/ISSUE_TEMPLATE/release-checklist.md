---
name: Release checklist
about: Use this checklist before cutting a new release
title: "release: vX.Y.Z checklist"
labels: ["release"]
assignees: []
---

## Version

- Target version: `vX.Y.Z`
- Release type: patch / minor / major

## Changelog and Docs

- [ ] Update [CHANGELOG.md](../../CHANGELOG.md) under `Unreleased`
- [ ] Move release notes into a new version section
- [ ] Verify README links are still valid
- [ ] Verify docs updates for changed behavior

## Quality Gates

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Smoke test: Dashboard, Live Test, Compare, Settings

## Model and Provider Checks

- [ ] OpenRouter catalog load works
- [ ] At least one live provider key test passes
- [ ] Fallback simulation still works without keys

## Export and Reporting

- [ ] CSV export works
- [ ] PNG export works

## CI/CD

- [ ] CI green on Linux/Windows/macOS
- [ ] Version bump workflow prepared (if used)
- [ ] Tag-based release workflow ready

## Deployment

- [ ] Choose deployment target (Vercel/Netlify/GitHub Pages)
- [ ] Verify SPA routing fallback
- [ ] Verify final production URL

## Post-Release

- [ ] Create release notes from template
- [ ] Announce release and key changes
- [ ] Open follow-up issues for known limitations
