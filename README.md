# ILBATECH Website

Official public website for ILBATECH, a business-led technology solutions and consulting company.

## Production

- Repository: `https://github.com/edmondilbawi/itg-website`
- GitHub Pages URL: `https://edmondilbawi.github.io/itg-website/`
- Repository base path: `/itg-website`
- Hosting architecture: Next.js static export deployed from source by GitHub Actions
- Custom domain: intentionally not configured

The Pages workflow is defined in `.github/workflows/deploy-pages.yml`. It installs locked dependencies, runs lint, builds the static export, uploads `out/` as a Pages artifact, and deploys through the `github-pages` environment. Generated output is not committed.

## Stack and Architecture

- Next.js 16.3 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `lucide-react`
- Static export via `output: "export"`
- Directory-style routes via `trailingSlash: true`

The website has six top-level routes plus four service details, four solution details, and a custom static 404. The primary navigation is Home, Services, Work, About, and Contact; Solutions remains available as supporting problem-led content and through existing deep links. Detail routes are generated at build time from the centralized offering data in `src/config/offerings.ts`.

## Local Development

```bash
npm ci
npm run dev
```

The default project-site base path is `/itg-website`, so local development is available at:

```text
http://localhost:3000/itg-website/
```

To simulate a future apex/custom-domain architecture locally, provide an empty base path at build time. The deployment workflow always receives the verified Pages base path from `actions/configure-pages`.

## Validation

```bash
npm ci
npm run lint
npm run build
npm audit
```

`npm run build` creates the static site in `out/`. The directory is generated and ignored by Git.

The interaction and destination map is recorded in `UX_ACCEPTANCE.md`.

## Site Configuration

Business identity and deployment defaults are centralized in `src/config/site.ts`:

- company name and short name
- public contact email and WhatsApp details
- GitHub Pages production URL
- repository URL
- default project-site base path

`NEXT_PUBLIC_SITE_URL` overrides the production URL when provided. It supplies `metadataBase`, Open Graph context, `robots.txt`, and `sitemap.xml`. `NEXT_PUBLIC_BASE_PATH` overrides the default `/itg-website` path and is shared by Next.js configuration and static internal-link normalization.

All internal paths pass through `getSitePath`. Contextual service and solution CTAs use `getContactPath` to carry only a supported Google Forms service value to Contact.

## Contact Form

The branded ILBATECH contact form submits directly to the owner’s published Google Form:

```text
ILBATECH contact form
  → public Google Forms formResponse endpoint
  → Google Form responses
  → linked Google Sheet
  → owner-controlled new-response email notification
```

Submission uses a native HTML POST targeted at a hidden iframe. The visitor remains on the ILBATECH website; no server, API key, OAuth token, Google credential, or application secret is required.

The verified public form contract is centralized in `src/config/google-form.ts`. Contextual Contact URLs are validated against the exact allowed Google option values before the select field is initialized. Invalid query values are ignored.

## GitHub Pages Notes

The project-site build uses:

```text
basePath: /itg-website
assetPrefix: /itg-website
NEXT_PUBLIC_SITE_URL: https://edmondilbawi.github.io/itg-website
```

The workflow uses only official GitHub actions for checkout, Node setup, Pages configuration, artifact upload, and deployment. Repository permissions are limited to source read, Pages write, and OIDC token write.

## Future Custom-Domain Migration

No custom domain is configured in this phase. When a domain is purchased:

1. Add and verify the domain in GitHub Pages settings.
2. Configure the required DNS records and wait for them to resolve.
3. Enable HTTPS after GitHub issues the certificate.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
5. Set `NEXT_PUBLIC_BASE_PATH` to an empty string if the website moves to the domain root; remove the project-path `assetPrefix` through the same configuration.
6. Rebuild and verify metadata, Open Graph URLs, `robots.txt`, `sitemap.xml`, every internal route, and every static asset.
7. Repeat the production browser and Google Forms acceptance checks.

## Brand and Deployment Constraints

The public brand is ILBATECH. The repository name, GitHub Pages URL, `/itg-website` base path, and internal identifiers may retain `itg` where required for deployment or compatibility.
