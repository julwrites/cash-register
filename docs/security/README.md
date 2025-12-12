# Security Documentation

Use this section to document security considerations, risks, and mitigations.

## Risk Assessment
*   [ ] Threat Model
*   [ ] Data Privacy

## Compliance
*   [ ] Requirements

## Secrets Management
The application relies on environment variables for sensitive configuration.

### Required Environment Variables
*   `AUTH_SECRET`: Used for signing JWTs.
*   `ADMIN_USERNAME`: Default admin username.
*   `ADMIN_PASSWORD`: Default admin password.

**Warning**: Do not commit `.env` files to version control.

## Authentication
- **Mechanism**: JWT (JSON Web Tokens).
- **Storage**: Tokens are stored in Local Storage (frontend) and verified on API requests.
- **Implementation**: Uses `@sidebase/nuxt-auth` and custom `jsonwebtoken` logic.

## Database Security
- **Access Control**: SQLite files are stored in `data/` directory, which should be secured on the server.
- **SQL Injection**: `better-sqlite3` uses prepared statements to prevent SQL injection.
