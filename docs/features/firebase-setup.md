# Firebase Authentication Setup

This project uses `nuxt-vuefire` to integrate Firebase.

## Environment Variables

To configure Firebase, you should use environment variables. This avoids hardcoding secrets in the codebase and allows for different configurations per environment (e.g., development, staging, production).

### Local Development

Create or update your `.env` file with the following variables:

```bash
NUXT_PUBLIC_VUEFIRE_CONFIG_API_KEY=your_api_key
NUXT_PUBLIC_VUEFIRE_CONFIG_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_VUEFIRE_CONFIG_PROJECT_ID=your_project_id
NUXT_PUBLIC_VUEFIRE_CONFIG_APP_ID=your_app_id
NUXT_PUBLIC_VUEFIRE_CONFIG_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_VUEFIRE_CONFIG_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_VUEFIRE_CONFIG_MEASUREMENT_ID=your_measurement_id
```

### GitHub Actions (CI/CD)

When building in GitHub Actions, you do **not** need to provide these secrets if you are building a Docker image that will run with these variables provided at runtime.

However, if you are building a static site or need these at build time for some reason:

1.  Go to your Repository Settings > Secrets and variables > Actions.
2.  Add the variables as Repository Secrets (or Variables).
3.  In your `.github/workflows/ci.yml`, you must map these secrets to environment variables in the build step:

```yaml
- run: npm run build
  env:
    NUXT_PUBLIC_VUEFIRE_CONFIG_API_KEY: ${{ secrets.NUXT_PUBLIC_VUEFIRE_CONFIG_API_KEY }}
    # ... others
```

### Docker / Runtime

Since we use Nuxt's `runtimeConfig`, you can provide these variables when starting the container:

```bash
docker run -e NUXT_PUBLIC_VUEFIRE_CONFIG_API_KEY=... my-image
```

## Why not `VITE_` variables?

`VITE_` variables are statically replaced at **build time**. This means:
1.  The secrets are embedded in the build artifact (JavaScript bundle).
2.  You must provide the secrets during `npm run build`.

By using `runtimeConfig` (and the `NUXT_PUBLIC_...` pattern), we allow the configuration to be injected at **runtime**, which is safer and more flexible for Docker deployments.
