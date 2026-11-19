---
title: 'Server-Driven UI (sbuiSDK) Components'
description: 'Reference for declarative sbuiSDK layout primitives, form controls, liquid vector QR, and dialogs.'
category: 'Server-Driven UI (sbuiSDK)'
order: 40
---

## What is Server-Driven UI?

Instead of hardcoding storefront order forms and customer dashboards in frontend templates, SaviorBill scripts declare UI components via JSON schemas that `SBPersonalAccountClient` renders natively.

![sbuiSDK Interactive Showcase](/images/docs/sbuisdk-showcase.png)

### Component Categories:
- **Layout:** `row`, `column`, `card`, `grid`, `divider`, `space`.
- **Typography:** `text` (`h1`..`h4`, `body`, `caption`, `code`), `badge`, `alert`.
- **Specialized:** `qr` (liquid, rounded, classic styles with logo), `datepicker`, `dialog`.
- **Form Controls:** `input`, `password`, `number`, `select`, `toggle`, `button`.
- **Reactivity:** `depends_on` (`field`, `equals`, `in`).
