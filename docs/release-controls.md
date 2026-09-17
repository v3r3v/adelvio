# Preview and production releases

## Default behavior

Pushing code is not approval to publish a website.

- Pushes to `main` or `preview/**`, and pull requests into `main`, run checks and build the Pages bundle. They do not publish it.
- `Adelvio preview checks and publishing` has a manual `publish_preview` checkbox, off by default. Checking it publishes only `https://v3r3v.github.io/adelvio/`, after checks pass.
- Cloudflare's `adelvio` Worker keeps its Git connection, but its dashboard **Deploy command** is a message-only command:

  ```sh
  node -e "console.log('Production deployment disabled; use an approved manual release.')"
  ```

  Builds can still run. This command cannot upload code or change live traffic. Builds for non-production branches were already off and remain off. Domains, routes, secrets and active versions are unchanged.
- `npm run deploy:cloudflare` is guarded in source: it refuses CI/Workers Builds and requires an explicit local production confirmation. This prevents accidental releases; it is not an access-control boundary. An authorized operator can still deploy directly through Cloudflare tooling.

## Publish a phone preview

1. Open GitHub **Actions → Adelvio preview checks and publishing → Run workflow**.
2. Select the branch to test, such as `preview/studio-refinement`.
3. Check **publish_preview** only when publication of that preview is approved.
4. Run the workflow. Open `https://v3r3v.github.io/adelvio/?lang=es` after **publish-preview** succeeds.

Leaving the checkbox off validates the branch without changing either website. Pages is public, and one published preview replaces the preceding one. The Pages portal link continues to point to the existing Cloudflare demo; this preview does not publish the local SQL backend.

## Release production when approved

Review and test the intended commit first. From a local checkout of that commit, with existing Cloudflare authentication:

```powershell
$env:SITE_URL = 'https://adelvio.com'
npm run build:cloudflare
npm run deploy:cloudflare -- --confirm-production=adelvio.com
```

The final command changes the live website. It is not part of a preview review. Do not put this confirmation flag in an automatic build command; the script refuses CI even if the flag is supplied. Missing or incorrect arguments, or a missing build, stop before Wrangler starts. Wrangler errors remain failures.

Keep the Cloudflare message-only deploy command in place for manual releases. To deliberately restore automatic releases later, separately review both the dashboard command and source guard.

## Verification

`npm run test:deployment` tests blocked arguments, CI refusal, missing assets, approved command construction and failure propagation. Process execution is mocked: tests never contact Cloudflare or deploy. The workflow checkbox defaults to false; write permissions exist only on the conditional Pages publishing job.

Cloudflare documents the independent commands and CI variables in its [build configuration reference](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
