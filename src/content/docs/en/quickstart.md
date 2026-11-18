---
title: 'Quickstart'
description: 'Deploy SaviorBill to production in under 2 minutes using the official install script.'
category: 'Getting Started'
order: 1
---

## One-Line Deployment

To deploy SaviorBill on a clean Linux server (Ubuntu 22.04+ / Debian 12+), run the official quickstart installer:

```bash
curl -fsSL https://get.saviorbill.com | bash
```

### What the installer handles:
1. Verifies and installs `Docker` & `Docker Compose` if missing.
2. Fetches the latest production `docker-compose.yml`, `Caddyfile`, and `.env` template.
3. Optionally deploys the customer storefront (`SBPersonalAccountClient`).
4. Generates cryptographic keys and starts the stack via `docker compose up -d`.

---

## Accessing Services After Launch

Once deployment completes:
- **Admin Dashboard:** `https://<DOMAIN>/`
- **REST API:** `https://<DOMAIN>/api/v1/`
- **OpenAPI / Swagger Docs:** `https://<DOMAIN>/api/docs`
- **Customer Storefront:** on your configured client domain.
