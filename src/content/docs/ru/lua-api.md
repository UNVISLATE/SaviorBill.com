---
title: 'Встроенные API и функции песочницы LuaWorker'
description: 'Полный справочник глобальных библиотек в песочнице Lua 5.4: HTTP-клиент, криптография, кэш Valkey, JSON, сервисные вызовы ядра и логирование.'
category: 'Интеграции и Lua'
order: 30
---

## Окружение песочницы LuaWorker

Скрипты исполняются в изолированном контейнере **Lua 5.4** с кастомной защищенной песочницей `sbox`. Для обеспечения безопасности многопользовательской среды и защиты от зависаний глобальное пространство изолировано:

- **Отключены небезопасные модули:** `io.*`, `os.execute`, `os.remove`, `os.rename`, `package.*`, `require` (доступны только предварительно зарегистрированные сервисные библиотеки);
- **Защита от бесконечных циклов:** лимит на **50 000 000 инструкций** на один запуск задачи;
- **Лимит на размер строк:** не более **1 МБ** (`1 048 576` байт) на одну операцию со строками;
- **Безопасная обработка ошибок:** функция `pcall` заменена на `safe_pcall`, которая никогда не маскирует критическое превышение инструкций или памяти.

Ниже приведен полный перечень встроенных библиотек, доступных напрямую в глобальной области каждого скрипта.

---

## 1. HTTP-клиент (`http`)

Выполняет исходящие синхронные запросы к внешним веб-серверам и REST API.

### Базовый вызов: `http(options)` или `http.request(options)`

```lua
local resp = http({
  url = "https://api.example.com/v1/users",
  method = "POST",             -- "GET" (по умолчанию), "POST", "PUT", "DELETE", "PATCH"
  headers = {
    ["Authorization"] = "Bearer " .. token,
    ["Content-Type"] = "application/json"
  },
  body = json.encode({ name = "John" }),
  timeout = 15                 -- Таймаут в секундах (по умолчанию: 10, максимум: 30)
})

if resp.ok and resp.status == 200 then
  local data = json.decode(resp.body)
  -- обработка
else
  error("Ошибка API: " .. tostring(resp.status) .. " " .. tostring(resp.body))
end
```

### Структура ответа `resp`:
- **`resp.ok`** (`boolean`): `true`, если HTTP-запрос завершился успешно (сетевой сокет открыт, ответ получен, статус < 500);
- **`resp.status`** (`number`): HTTP-код ответа сервера (`200`, `201`, `400`, `404` и т.д.);
- **`resp.headers`** (`table`): заголовки ответа сервера в нижнем регистре;
- **`resp.body`** (`string`): сырое тело ответа;
- **`resp.error`** (`string | nil`): описание сетевой ошибки в случае неудачи (таймаут, DNS failure, connection refused).

### Вспомогательные методы:
- **`http.urlencode(data)`**: кодирует строку или ассоциативную таблицу в формат `application/x-www-form-urlencoded`.
  ```lua
  local query = http.urlencode({ client_id = "123", redirect_uri = "https://example.com" })
  -- "client_id=123&redirect_uri=https%3A%2F%2Fexample.com"
  ```
- **`http.urldecode(string)`**: декодирует percent-encoded строку.
- **`http.parse_form(body_string)`**: парсит тело формы `a=1&b=2` в Lua-таблицу.

---

## 2. Работа с JSON (`json`)

Высокоскоростной парсер и сериализатор на базе C-библиотеки `cjson`.

- **`json.encode(table)`**: сериализует Lua-таблицу в валидную JSON-строку.
  ```lua
  local payload_str = json.encode({ status = "active", count = 5 })
  ```
- **`json.decode(string)`**: парсит JSON-строку в Lua-таблицу. Если строка невалидна, вызывает ошибку (рекомендуется оборачивать в `pcall`).
  ```lua
  local ok, data = pcall(json.decode, resp.body)
  if ok and type(data) == "table" then
    print(data.result)
  end
  ```

---

## 3. Криптография и хеширование (`crypto`)

Реализована поверх системного OpenSSL (`luaossl`) с оптимизированными чистыми Lua-энкодерами.

### Хеширование и контрольные суммы:
- **`crypto.sha256(str)`** — SHA-256 хеш в виде hex-строки (64 символа);
- **`crypto.sha512(str)`** — SHA-512 хеш в виде hex-строки (128 символов);
- **`crypto.sha1(str)`** — SHA-1 хеш в виде hex-строки;
- **`crypto.md5(str)`** — MD5 хеш в виде hex-строки.

### HMAC (подписи запросов и валидация вебхуков):
- **`crypto.hmac_sha256(key, message)`** — вычисление подписи HMAC-SHA256 (hex);
- **`crypto.hmac_sha512(key, message)`** — вычисление подписи HMAC-SHA512 (hex).

Пример валидации подписи CryptoBot:
```lua
local secret_key = crypto.sha256(token)
local calculated_signature = crypto.hmac_sha256(secret_key, ctx.request.body)
if calculated_signature == received_signature then
  -- вебхук подлинный
end
```

### Кодирование данных:
- **`crypto.base64_encode(binary_or_str)`** — кодирование в Base64;
- **`crypto.base64_decode(b64_str)`** — декодирование из Base64;
- **`crypto.hex(binary_data)`** — преобразование байтовой строки в hex;
- **`crypto.url_encode(str)`** / **`crypto.url_decode(str)`**.

---

## 4. Быстрый распределённый кэш (`cache`)

Предоставляет доступ к быстрому key-value хранилищу (Valkey / Redis). Все ключи скрипта автоматически изолируются префиксом. Идеально для кэширования временных JWT/Bearer токенов сессий администратора внешних панелей (Marzban, 3x-ui, Proxmox).

- **`cache.get(key)`** — получить строковое значение по ключу (или `nil`, если ключ отсутствует или истёк).
  ```lua
  local token = cache.get("admin_token:node_1")
  ```
- **`cache.set(key, value, [ttl_seconds])`** — сохранить значение с опциональным временем жизни в секундах.
  ```lua
  -- Сохранить токен на 30 минут
  cache.set("admin_token:node_1", token, 1800)
  ```
- **`cache.del(key)`** — удалить ключ из кэша (например, при получении 401 Unauthorized для принудительного обновления).
  ```lua
  cache.del("admin_token:node_1")
  ```
- **`cache.incr(key)`** — атомарно увеличить целочисленный счётчик на 1.

---

## 5. Взаимодействие с ядром платформы (`billing`)

Позволяет скрипту выполнять системные операции ядра биллинга через защищенный внутренний сокет.

### `billing.import_keys(service_or_slug, keys_array)`
Используется для автоматического импорта пула цифровых лицензионных ключей или кодов активации, полученных оптом от внешнего поставщика.

```lua
local res = billing.import_keys("steam-gift-cards", {
  "XXXX-YYYY-ZZZZ-0001",
  "XXXX-YYYY-ZZZZ-0002",
  "XXXX-YYYY-ZZZZ-0003"
})

if res.ok then
  log.info(string.format("Импортировано: %d ключей, дубликатов: %d", res.imported, res.duplicates))
end
```

### `billing.send_email(options)`
Отправка персонализированного письма пользователю с рендерингом на стороне ядра через шаблонизатор Jinja2.

```lua
billing.send_email({
  to = "buyer@example.com",
  template = "vpn_welcome_instructions", -- слаг шаблона из админки
  context = {
    username = "user_42",
    subscription_url = "https://..."
  }
})
```

---

## 6. Логирование выполнения (`log`)

Все записи логов собираются воркером и сохраняются в базе данных SaviorBill с привязкой к конкретной транзакции или услуге. Они мгновенно отображаются в админ-панели в разделе **Система → Аудит**:

```lua
log("Скрипт запущен для действия: " .. tostring(ctx.action)) -- эквивалентно log.info
log.info("Авторизация в Marzban успешна")
log.warn("Повторная попытка запроса из-за тайм-аута")
log.error("Критическая ошибка создания пользователя: " .. tostring(err))
```

---

## 7. Стандартная библиотека Lua

В песочнице полностью доступны следующие стандартные функции и библиотеки Lua:
- **Математика (`math`):** `math.floor`, `math.ceil`, `math.random`, `math.randomseed`, `math.max`, `math.min`, `math.abs` и др.
- **Строки (`string`):** `string.format`, `string.sub`, `string.gsub`, `string.find`, `string.match`, `string.gmatch`, `string.byte`, `string.char`, `string.lower`, `string.upper`, `string.len`.
- **Таблицы (`table`):** `table.insert`, `table.remove`, `table.concat`, `table.sort`, `table.pack`, `table.unpack`.
- **Время (`os`):** `os.time()` (текущий Unix timestamp в секундах), `os.date([format, time])`.
- **Базовые функции:** `tostring`, `tonumber`, `pairs`, `ipairs`, `type`, `assert`, `error`, `pcall`, `xpcall`.
