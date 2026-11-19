---
title: 'Полная спецификация контрактов Lua (A–Z)'
description: 'Детальное руководство по контрактам SaviorBill: структуры входного контекста ctx, поддерживаемые действия и форматы возвращаемых данных для всех типов скриптов.'
category: 'Интеграции и Lua'
order: 20
---

## Концепция контрактов SaviorBill

Все пользовательские интеграции в SaviorBill выполняются в изолированном воркере **LuaWorker** (LuaJIT) по жестко стандартизированным контрактам.

Каждый скрипт представляет собой модуль, возвращающий таблицу с единственной точкой входа:
```lua
local M = {}

function M.handle(ctx)
  -- обработка действия ctx.action
  return { ... }
end

return M
```

Входной параметр `ctx` — это иммутабельный словарь данных задачи, подготовленный ядром платформы. Скрипт не имеет прямого доступа к базе данных PostgreSQL и общается с миром только через детерминированный возврат таблицы и изолированные API.

---

## 1. Контракт скрипта выдачи услуги (`Service`)

Обслуживает полный жизненный цикл заказанного цифрового товара, VPN, сервера или подписки.

### Поддерживаемые действия (`ctx.action`):
- **`create`** — первичная генерация и активация услуги после подтверждения оплаты заказа;
- **`renew`** — продление срока действия услуги (при получении очередного платежа или списании с баланса);
- **`freeze`** / **`stop`** — временная блокировка или приостановка (например, при окончании оплаченного периода или нехватке средств на автопродление);
- **`unfreeze`** — восстановление доступа после оплаты задолженности;
- **`delete`** — полное удаление услуги и освобождение ресурсов на внешнем сервере.

### Входная структура `ctx`:
```lua
{
  action = "create", -- "create" | "renew" | "stop" | "delete" | "freeze"
  lua = {
    id = 12,
    slug = "marzban-vless",
    name = "Marzban VLESS VPN",
    kind = "service",
    actions = { "create", "renew", "stop", "delete", "freeze" },
    settings = {
      marzban_domain = "panel.example.com",
      marzban_user = "admin",
      marzban_pass = "secret"
    }
  },
  user = {
    id = 104,
    login = "buyer_user",
    email = "client@example.com",
    service = {
      id = 301,
      status = "active",         -- текущий статус услуги в БД
      expires_at = 1770000000,    -- Unix timestamp окончания (nil при первом create)
      public_data = { ... },      -- ранее сохранённые публичные данные
      private_data = { ... }      -- ранее сохранённые приватные данные
    },
    payment = 452                 -- ID платежа, инициировавшего действие (или nil)
  },
  service = {
    id = 15,
    slug = "vpn-amsterdam-vless",
    name = "VPN Amsterdam (VLESS)",
    price = "150.00",
    currency = "RUB",
    duration = 2592000,           -- длительность тарифа в секундах (30 дней)
    settings = {
      data_limit_gb = 50,
      reset_strategy = "month"
    }
  },
  order = {
    amount = "150.00",
    currency = "RUB",
    tier = "1_month",
    group = "vpn_europe",
    components = { ... },
    form = {                      -- значения полей, заполненных покупателем в sbuiSDK-форме
      preferred_node = "ams-01",
      protocol = "vless"
    }
  }
}
```

### Формат возвращаемого ответа:
Функция `M.handle(ctx)` при успешном выполнении должна вернуть таблицу следующего вида:

```lua
return {
  -- Публичные данные: передаются покупателю и отображаются в личном кабинете.
  -- Сюда помещаются ссылки на подписку, конфиги, логины, порты и Server-Driven UI манифесты.
  public = {
    subscription_url = "https://panel.example.com/sub/token_xyz",
    username = "sb_104_a89f2e",
    node_type = "VLESS"
  },

  -- Приватные данные: сохраняются в защищённом хранилище ядра и не видны покупателю.
  -- Передаются обратно в ctx.user.service.private_data на последующих вызовах renew/delete.
  private = {
    marzban_username = "sb_104_a89f2e",
    allocated_ip = "192.168.10.55"
  },

  -- Целевой статус услуги в биллинге: "active" | "suspended" | "terminated"
  state = "active",

  -- Момент истечения срока действия (Unix timestamp в секундах)
  expires_at = 1772592000
}
```

---

## 2. Контракт платёжного шлюза (`Payment`)

Обрабатывает входящие и исходящие финансовые транзакции: генерацию ссылок на оплату, приём вебхуков от банков и платёжных шлюзов, перепроверку статусов и возвраты.

### Поддерживаемые действия (`ctx.action`):
- **`create`** — создание счёта/инвойса в платёжной системе. Возвращает платёжный URL;
- **`callback`** — приём и валидация входящего HTTP-вебхука от платёжного шлюза;
- **`check`** — фоновая сверка статуса платежа по таймеру биллинга (polling);
- **`refund`** — возврат средств покупателю.

### Входная структура `ctx`:
```lua
{
  action = "create", -- "create" | "callback" | "check" | "refund"
  user = {
    id = 104,
    login = "buyer_user",
    email = "client@example.com"
  },
  payment = {
    id = 8901,
    amount = "250.00",
    currency = "RUB",
    status = "pending",
    return_url = "https://billing.example.com/payment/success",
    provider_data = {
      secrets = {
        shop_id = "123456",
        secret_key = "live_secret_key"
      }
    }
  },
  -- Поле request присутствует ТОЛЬКО при действии "callback"
  request = {
    method = "POST",
    headers = {
      ["content-type"] = "application/json",
      ["crypto-pay-api-signature"] = "abc123..."
    },
    body = "{\"event\":\"payment.succeeded\", ...}",
    query = {}
  }
}
```

### Формат ответа для `create`:
```lua
return {
  confirmation_url = "https://checkout.yookassa.ru/v2/payment/...", -- ссылка на оплату
  external_id = "2d8f90-000f-5000-8000-1b2c3d4e5f6a",               -- ID в платёжке
  payment_id = ctx.payment.id
}
```

### Формат ответа для `callback` и `check`:
```lua
return {
  public = {},
  private = {
    ok = true,               -- флаг успешной обработки
    paid = true,             -- true, если платёж подтверждён и успешен
    failed = false,          -- true, если платёж отменён или истёк
    payment_id = 8901,       -- внутренний ID платежа в SaviorBill
    external_id = "2d8f90-000f-...",
    status = "succeeded"     -- оригинальный статус платёжки
  }
}
```

### Формат ответа для `refund`:
```lua
return {
  ok = true,
  refund_id = "ref_992104",
  status = "succeeded"
}
```

---

## 3. Контракт OAuth / OIDC авторизации (`Auth`)

Обеспечивает вход пользователей через внешние сервисы (Google, GitHub, Telegram, Discord, OIDC).

### Поддерживаемые действия (`ctx.action`):
- **`start`** — построение URL авторизации провайдера с передачей `state` и `redirect_uri`;
- **`callback`** — обмен полученного `code` на токены и профиль пользователя.

### Контекст и возврат:
- При `action == "start"`:
  - Возвращает `{ authorize_url = "https://accounts.google.com/o/oauth2/v2/auth?..." }`.
- При `action == "callback"`:
  - Возвращает профиль пользователя:
    ```lua
    return {
      external_id = "gh_9812401",
      email = "dev@unvi.xyz",
      email_verified = true,
      login = "unvislate",
      name = "Andrey UNVI",
      avatar_url = "https://avatars.githubusercontent.com/u/9812401"
    }
    ```

---

## 4. Контракт триггерных действий (`Trigger`)

Позволяет запускать кастомную бизнес-логику при наступлении системных событий ядра (регистрация пользователя, смена статуса услуги, оплата, тикеты).

### Входная структура `ctx`:
```lua
{
  event = "payment.succeeded",
  config = {
    telegram_chat_id = "-1001234567890",
    notify_channel = true
  },
  data = {
    payment_id = 452,
    user_id = 104,
    amount = "150.00",
    currency = "RUB",
    service_id = 15
  }
}
```

Скрипт может выполнить HTTP-запрос (например, отправить уведомление в Telegram) и вернуть `{ ok = true, result = "Sent" }`.

---

## 5. Контракт почтового транспорта (`Email`)

Позволяет подключить любой кастомный сервис отправки писем (Resend, Mailgun, SMTP-шлюзы, локальный Postfix) через Lua.

### Входная структура `ctx`:
```lua
{
  action = "send", -- "send" | "test"
  email = {
    to = "client@example.com",
    subject = "Ваш заказ #104 успешно активирован",
    body = "<h1>Спасибо за заказ!</h1>...",
    text = "Спасибо за заказ!...",
    is_html = true,
    from_email = "no-reply@saviorbill.com",
    from_name = "SaviorBill Robot"
  },
  config = {
    api_key = "re_...",
    endpoint = "https://api.resend.com/emails"
  }
}
```

Возвращает `{ ok = true }` или вызывает ошибку `error("Сообщение об ошибке")`.
