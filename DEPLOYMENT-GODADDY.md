# Deploying Frame by Narendra outside ChatGPT Sites

This branch contains the current portfolio source and assets, including the brighter lime 5+ years badge.
Source snapshot: 6c401a9dcd8481be44319d5110ad51ad1208752b.

## Hosting status

This is a source handoff, not a verified GoDaddy deployment.
The current live website continues to run at https://narendra-portfolio-editor.designbynarendra.chatgpt.site.
Pushing this branch does not update that Sites publication.

## Required GoDaddy migration

GoDaddy Node.js Hosting supports connecting a GitHub repository and branch. Public publishing requires an eligible Web Hosting plan. A domain purchase alone is not a hosting subscription.

The current application targets Cloudflare Workers through Vinext. It uses:
- A Cloudflare D1 database for reviews (db/index.ts imports cloudflare:workers).
- ChatGPT Sites authentication headers and its sign-in route for review ownership.
- Worker build/start scripts and Cloudflare Vite integration.

These do not automatically work on a conventional GoDaddy Node.js server. Before production:
1. Confirm the exact GoDaddy hosting product and its Node.js support.
2. Port the build and start path to a supported Node.js runtime that listens on process.env.PORT.
3. Replace the D1 adapter with a database supported by the target host and apply the review schema migration.
4. Replace dispatch-provided ChatGPT sign-in with properly verified authentication. Never trust the existing oai-authenticated-user-* HTTP headers on a public standalone Node.js host.
5. Configure secrets in the host, never in GitHub. Do not copy live database records without an explicit migration plan.
6. Build and test the homepage, /experience, video dialogs, resume download, and review create/update/remove behavior on a private hosting preview.
7. Set canonical URLs, sitemap and structured data to https://framesbynarendra.com.
8. Connect framesbynarendra.com and www only after preview verification; then confirm HTTPS and redirects.

Do not delete your GoDaddy domain registration. A domain connection conflict in Sites is separate from DNS at GoDaddy; using another host requires pointing DNS to that host.

## Official references
- https://www.godaddy.com/en-in/hosting/nodejs
- https://developer.godaddy.com/en/docs/api-users/hosting/app-requirements

The original README documents the current Sites/Cloudflare setup.
No credentials, installed dependencies, live database records or Git history are included in this source snapshot.
