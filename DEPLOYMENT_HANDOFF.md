# ILBATECH GitHub Pages Deployment Handoff

## Authorized Destination

- Owner: `edmondilbawi`
- Repository: `itg-website`
- Remote: `https://github.com/edmondilbawi/itg-website.git`
- Branch: `main`
- Production URL: `https://edmondilbawi.github.io/itg-website/`
- Visibility: public
- Custom domain: intentionally not configured

Do not create a second repository or deploy this project to another provider.

## Deployment Architecture

The Next.js App Router application is a fully static export:

- `output: "export"`
- `trailingSlash: true`
- production `basePath: "/itg-website"`
- production `assetPrefix: "/itg-website"`
- generated directory: `out/` (ignored by Git)

`NEXT_PUBLIC_BASE_PATH` can override the default project path. The Pages workflow uses the verified `base_path` output from `actions/configure-pages`, so internal Next.js assets and source-generated links share the same repository path.

`NEXT_PUBLIC_SITE_URL` can override the default production URL. The current default is the authorized GitHub Pages project URL and is used by root metadata, Open Graph context, `robots.txt`, and `sitemap.xml`.

## GitHub Actions

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and manual dispatch. It performs:

1. source checkout;
2. Node 22 setup with npm caching;
3. GitHub Pages configuration;
4. `npm ci`;
5. `npm run lint`;
6. `npm run build`;
7. upload of `out/` as the Pages artifact;
8. deployment to the `github-pages` environment.

It uses official GitHub actions and least-privilege permissions:

- `contents: read`
- `pages: write`
- `id-token: write`

The repository Pages source must be GitHub Actions. If it is not already configured, an authenticated owner with repository administration permission must enable it in **Settings → Pages → Build and deployment → Source → GitHub Actions**, or configure the equivalent through the GitHub API.

## Public Route Architecture

Top-level routes:

- `/`
- `/services/`
- `/work/`
- `/solutions/`
- `/about/`
- `/contact/`

Service detail routes:

- `/services/websites-and-commerce/`
- `/services/software-and-applications/`
- `/services/automation-and-ai/`
- `/services/business-systems-and-consulting/`

Solution detail routes:

- `/solutions/customer-experience-and-growth/`
- `/solutions/process-automation/`
- `/solutions/operational-systems/`
- `/solutions/digital-transformation/`

A branded `404.html` is generated for invalid static routes. All detail routes use `generateStaticParams`, and unknown dynamic values are disabled through `dynamicParams = false`.

## Google Forms Lead Pipeline

```text
ILBATECH Contact page
  → native cross-origin HTML POST
  → published Google Forms /formResponse endpoint
  → hidden named iframe
  → linked Google Sheet
  → owner-controlled response notification
```

The client distinguishes the iframe’s initial load from the post-submit load, prevents duplicate submissions, resets the form after success, and exposes accessible sending, success, and error states. No Google credentials are used.

Verified public contract:

| Website field | Google entry ID | Google required? |
| --- | --- | --- |
| Full Name | `entry.1344544065` | Yes |
| Email | `entry.1542327069` | No; required by ILBATECH |
| Company Name | `entry.1123393057` | Yes |
| Service | `entry.415823819` | Yes |
| Project | `entry.231616111` | Yes |
| Additional Details | `entry.2137717800` | No |

Contextual CTAs add a `service` query parameter to Contact. The client accepts it only when it exactly matches one of the published Google option values; invalid values are ignored.

## Historical Lead Acceptance

The local pipeline was owner-verified end to end before the deployment phase:

- Google Forms browser submission: pass
- linked Google Sheet receipt: owner verified
- new-response email notification: owner verified

Historical controlled test:

- Timestamp: `2026-08-15 05:03:36 GMT+3` (`Asia/Beirut`)
- Name: `ITG WEBSITE INTEGRATION TEST`
- Company: `ITG TEST — DO NOT CONTACT`
- Email: `edmondilbawi+itg-test@gmail.com`
- Service: `Website Development`
- Network result: Google `formResponse` HTTP 200

The final GitHub Pages acceptance requires exactly one new controlled submission from the live public Contact page. Do not repeat it after Google accepts the first POST.

## Required Production Acceptance

After a successful Pages deployment:

1. Open every route directly under `/itg-website/` and refresh it.
2. Verify CSS, JavaScript, fonts, favicon, and static assets load from the project path.
3. Test desktop and mobile navigation, all catalog/detail actions, contextual Contact selection, footer actions, `mailto:`, and 404 recovery.
4. Test representative widths `375`, `430`, `768`, `1024`, `1366`, and `1536` without horizontal overflow.
5. Inspect browser console, exceptions, network failures, keyboard focus, labels, headings, and accessible control names.
6. Verify production `robots.txt` and `sitemap.xml` reference the GitHub Pages URL.
7. Send exactly one authorized production Google Forms test and record its timestamp and identity.

The full action map is maintained in `UX_ACCEPTANCE.md`.

## Future Custom Domain

When a domain is purchased and explicitly authorized:

1. configure and verify DNS;
2. set the GitHub Pages custom domain;
3. enable HTTPS;
4. update `NEXT_PUBLIC_SITE_URL`;
5. set `NEXT_PUBLIC_BASE_PATH` to empty if the site moves to the domain root, which also removes the project-path asset prefix;
6. revalidate metadata, Open Graph, robots, sitemap, routes, assets, and the contact pipeline;
7. update documentation with the final URL.

Production branding is ILBATECH. The repository, GitHub Pages URL, and `/itg-website` base path remain unchanged for deployment compatibility.
