<<<<<<< HEAD
# Traffic-GO
## Traffic GO is a React Native App meant to help users navigate traffic with alternate routes and information of high volume areas nearby.

## Deploying the Web App

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-web.yml`) that builds the Expo web app and deploys the static output to GitHub Pages on pushes to `main`.

Quick local commands:

```bash
# install deps
npm ci

# export a static web build into ./web-build
npm run export:web

# serve the build locally (optional - requires a static server)
npx serve web-build
```

Notes:
- Ensure your repo is pushed to GitHub and GitHub Pages is enabled (branch: `gh-pages` or use the repository settings default). The workflow uses the built-in `GITHUB_TOKEN` to push.
- If you prefer another target (EAS builds for app stores, Netlify, Vercel), tell me and I can add config for that.
=======
## Traffic GO is a React Native App meant to help users navigate traffic with alternate routes and information of high volume areas nearby.
>>>>>>> 798e9a5149ce5ba752d800eaa8c76164c52165de
