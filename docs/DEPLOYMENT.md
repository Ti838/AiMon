# Deployment Guide

This guide covers deploying AiMon to Vercel, Netlify, and GitHub Pages.

## Before Deploying

1. Run quality checks locally:

```bash
npm ci
npm run lint
npm run build
```

2. Confirm documentation and changelog are updated for release.
3. Ensure no secrets are committed.

## Option 1: Vercel

### Steps

1. Import repository in Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

### SPA Fallback

Vercel normally handles Vite SPA routing. If custom routes are used, add rewrite rules in `vercel.json`.

## Option 2: Netlify

### Steps

1. Import repository in Netlify.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy.

### SPA Redirect

Create `public/_redirects` with:

```text
/* /index.html 200
```

This ensures deep links work for SPA routes.

## Option 3: GitHub Pages

### Requirements

- Enable Pages in repository settings.
- Use GitHub Actions as source.
- Configure Vite `base` for repository path if needed.

If your repo is `https://github.com/<user>/<repo>`, set base to `/<repo>/` in `vite.config.js` for production builds.

### Workflow

Use `.github/workflows/deploy-pages.yml` (included in this repository) to:

1. Build the project.
2. Upload `dist` as Pages artifact.
3. Deploy to GitHub Pages.

## Post-Deployment Checklist

- Verify landing page loads.
- Verify deep links and refresh behavior.
- Verify Live Test page and model picker render correctly.
- Verify Dashboard/Compare exports work.
- Verify dark/light mode and responsiveness.

## Rollback Strategy

- Vercel/Netlify: restore previous successful deployment.
- GitHub Pages: redeploy previous tag/commit using Actions.
