---
title: 'Markdown & Components Showcase'
description: 'Full demonstration sandbox: typography, lists, task checkboxes, blockquotes, code blocks, tables, and interactive widgets.'
date: '2026-11-19'
author: 'UNVI'
tags: ['Demo', 'Markdown', 'Typography', 'Showcase']
faq:
  - question: 'What is the purpose of this page?'
    answer: 'It demonstrates all supported Markdown typography styles, table alignments, syntax highlighting, and layout proportions.'
---

This is a comprehensive showcase page to test typography, layout margins, and interactive components.

# Heading 1 (H1)

Standard body paragraph testing line-height, text color, and readability. You can use **bold text**, *italic text*, ~~strikethrough~~, or `inline code snippets`.

## Heading 2 (H2)

A paragraph containing an [internal documentation link](/en/docs/quickstart) and an [external GitHub repository link](https://github.com/UNVISLATE/SaviorBill).

### Heading 3 (H3)

Lists testing:

#### Unordered List:
- First item with teal bullet
- Second item with detailed description
  - Nested sub-item
  - Another nested sub-item
- Third item

#### Task Lists:
- [x] Deploy SaviorBill Core container
- [x] Configure PostgreSQL and Valkey connections
- [ ] Upload custom Lua payment script
- [ ] Publish first digital product

---

## Blockquotes

> **SaviorBill Engineering Principle:**  
> Architecture must be deterministic. The billing core must never depend on flaky third-party APIs, and customer interfaces should be driven declaratively by backend manifests.

---

## Data Tables

| Component | Stack | Role in System | Status |
| :--- | :--- | :--- | :--- |
| **BillingCore** | Python 3.12 + FastAPI | API, transactions, balance ledger | Production |
| **LuaWorker** | LuaJIT 5.4 Sandbox | Service hooks & payment callbacks | Production |
| **MediaWorker** | FastAPI + FFmpeg | WebP/WebM conversion & S3 sync | Production |
| **sbuiSDK** | TypeScript + React | Server-Driven UI manifest renderer | Production |

---

## Code Highlighting

```lua
function handle(ctx)
  if ctx.action == "create" then
    return {
      public = { token = "token_123" },
      state = "active",
      expires_at = os.time() + 86400 * 30
    }
  end
end
```

---

## Screenshots Demo

![Admin Services Catalog](/images/admin-services.png)
