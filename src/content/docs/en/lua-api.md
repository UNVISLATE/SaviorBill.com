---
title: 'Built-in LuaWorker Sandbox APIs & Functions'
description: 'Complete API reference for LuaWorker: HTTP client, cryptography, Valkey caching, JSON parser, and billing hooks.'
category: 'Integrations & Lua'
order: 30
---

## Global Sandbox Libraries

All Lua scripts execute in a sandboxed Lua 5.4 runtime with the following built-in globals:

1. **`http(opts)` / `http.request(opts)`**: Fast synchronous HTTP client (`resp.ok`, `resp.status`, `resp.headers`, `resp.body`).
2. **`json.encode(tbl)` / `json.decode(str)`**: C-based high performance JSON parser.
3. **`crypto.*`**: OpenSSL-powered cryptographic hashing (`sha256`, `sha512`, `md5`, `hmac_sha256`, `base64_encode`, `base64_decode`).
4. **`cache.*`**: Valkey-backed distributed key-value cache (`get`, `set`, `del`, `incr`).
5. **`billing.*`**: Core billing hooks (`import_keys`, `send_email`).
6. **`log.*`**: Audited logging (`log.info`, `log.warn`, `log.error`).
