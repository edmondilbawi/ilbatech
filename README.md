# ILBATECH Website

Official public website for ILBATECH, a business-led technology solutions and consulting company.

## Production

- Repository: `https://github.com/edmondilbawi/ilbatech`
- Production URL: `https://ilbatech.com/`
- Canonical origin: `https://ilbatech.com`
- Public base path: `/`
- Hosting architecture: Next.js static export deployed from source by GitHub Actions
- GitHub Pages custom domain: `ilbatech.com`

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

The application is configured for the custom-domain root, so local development is available at:

```text
http://localhost:3000/
```

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
- custom-domain production URL
- repository URL

`NEXT_PUBLIC_SITE_URL` overrides the production URL when provided. It supplies `metadataBase`, canonical and Open Graph context, `robots.txt`, and `sitemap.xml`. Internal links are normalized as root-relative directory routes for the custom domain.

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

The custom-domain build uses:

```text
basePath: not set
assetPrefix: not set
NEXT_PUBLIC_SITE_URL: https://ilbatech.com
```

The workflow uses only official GitHub actions for checkout, Node setup, Pages configuration, artifact upload, and deployment. Repository permissions are limited to source read, Pages write, and OIDC token write.

## Custom-Domain Operations

The GitHub Pages custom domain and DNS are managed outside the application repository. The Actions deployment publishes a root-path static export and does not require a tracked `CNAME` file for the current Pages deployment model.

1. Keep `ilbatech.com` configured in GitHub Pages settings.
2. Keep the external apex and `www` DNS records aligned with GitHub Pages.
3. Enable HTTPS after GitHub finishes certificate provisioning.
4. Rebuild and verify metadata, Open Graph URLs, `robots.txt`, `sitemap.xml`, internal routes, and static assets after any hosting change.
5. Repeat the production browser and Google Forms acceptance checks after material deployment changes.

## Brand and Deployment Constraints

The public brand, repository name, and `https://ilbatech.com/` production URL are aligned as ILBATECH. Historical internal identifiers may retain `itg` where changing them would not affect the public deployment.
