---
title: 'Спецификация manifest.json для Lua-скриптов'
description: 'Как описать манифест Lua-интеграции: метаданные, формы настроек для админки, типы полей и правила упаковки.'
category: 'Интеграции и Lua'
order: 10
---

## Назначение manifest.json

Каждый Lua-скрипт в SaviorBill (модуль выдачи услуги, эквайринг, OAuth-провайдер или триггер) сопровождается файлом манифеста `manifest.json`.

Манифест решает три задачи:
1. **Регистрация в ядре биллинга:** определяет системный идентификатор (`id` / `slug`), имя, категорию, автора и поддерживаемые действия жизненного цикла (`actions`).
2. **Генерация UI в панели администратора:** описывает схему полей настроек (`settings`). На основе этих данных админка SaviorBill автоматически строит формы ввода параметров (текстовые поля, пароли, переключатели, выпадающие списки) без написания фронтенд-кода.
3. **Управление версиями:** фиксирует версию скрипта (`version`), статус стабильности (`status`) и совместимость.

---

## Базовая структура манифеста

Пример минимального манифеста для скрипта выдачи услуги:

```json
{
  "id": "marzban-vless",
  "name": "Marzban VLESS VPN Delivery",
  "category": "VPN & Proxies",
  "author": "Andrey UNVI",
  "version": "1.0.0",
  "status": "stable",
  "description": "Автоматическая выдача и продление VLESS-подписок через REST API панели Marzban.",
  "actions": [
    "create",
    "renew",
    "stop",
    "delete",
    "freeze"
  ],
  "settings": {
    "marzban_domain": {
      "type": "string",
      "label": "Домен панели Marzban",
      "placeholder": "panel.example.com",
      "required": true,
      "help": "Адрес панели без протокола https://"
    },
    "marzban_user": {
      "type": "string",
      "label": "Логин администратора",
      "required": true
    },
    "marzban_pass": {
      "type": "password",
      "label": "Пароль администратора",
      "required": true
    },
    "data_limit_gb": {
      "type": "number",
      "label": "Лимит трафика (ГБ)",
      "default": 0,
      "help": "0 — безлимитный трафик"
    },
    "reset_strategy": {
      "type": "select",
      "label": "Сброс трафика",
      "default": "no_reset",
      "options": [
        { "value": "no_reset", "label": "Без сброса" },
        { "value": "month", "label": "Ежемесячно" },
        { "value": "year", "label": "Ежегодно" }
      ]
    }
  }
}
```

---

## Корневые поля манифеста

| Поле | Тип | Обязательное | Описание |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Да** | Уникальный слаг интеграции (латиница, цифры, дефисы). Например: `yookassa-payment`, `marzban-vless`. |
| `name` | `string` | **Да** | Человекочитаемое название модуля для отображения в списках и каталоге. |
| `category` | `string` | **Да** | Категория интеграции: `VPN & Proxies`, `Payments`, `Hosting & Cloud`, `Game Servers`, `Automation`. |
| `author` | `string` | Нет | Имя или никнейм автора скрипта (по умолчанию: `Andrey UNVI` или название контрибьютора). |
| `version` | `string` | **Да** | Семантическая версия (SemVer), например `1.0.0` или `0.9.8-beta`. |
| `status` | `string` | Нет | Статус готовности модуля: `stable` (рекомендован для продакшена) или `not-stable` (бета/в разработке). |
| `description` | `string` | **Да** | Краткое описание функционала и поддерживаемых протоколов. |
| `actions` | `array<string>` | **Да** | Массив действий, которые реализует функция `M.handle(ctx)`. Ядро проверяет поддержку действия перед запуском воркера. |
| `settings` | `object` | Нет | Словарь параметров конфигурации для автоматической генерации форм в админке. |

---

## Поддерживаемые типы полей в `settings`

Словарь `settings` состоит из именованных объектов. Ключ объекта — это имя переменной, которая будет доступна в Lua через `ctx.service.settings[key]` или `ctx.lua.settings[key]`.

### 1. Текстовая строка (`string`)
Обычное однострочное поле ввода.
```json
"panel_host": {
  "type": "string",
  "label": "Хост сервера",
  "placeholder": "node1.vpn.host",
  "default": "localhost",
  "required": true,
  "help": "IP-адрес или домен ноды"
}
```

### 2. Секретный ключ или пароль (`password`)
Поле скрытого ввода (символы маскируются звёздочками, значение шифруется в базе данных платформы).
```json
"api_secret": {
  "type": "password",
  "label": "Секретный токен API",
  "required": true,
  "help": "Сгенерируйте токен в панели провайдера"
}
```

### 3. Числовое значение (`number`)
Поле ввода целых чисел или значений с плавающей точкой.
```json
"port": {
  "type": "number",
  "label": "Порт подключения",
  "default": 443,
  "required": true
}
```

### 4. Выпадающий список (`select`)
Выбор одного значения из предопределенного перечня.
```json
"protocol": {
  "type": "select",
  "label": "Протокол шифрования",
  "default": "vless",
  "options": [
    { "value": "vless", "label": "VLESS (Vision + Reality)" },
    { "value": "trojan", "label": "Trojan (TLS)" },
    { "value": "shadowsocks", "label": "Shadowsocks-2022" }
  ]
}
```

### 5. Переключатель / флаг (`toggle` или `boolean`)
Логическое поле (да/нет).
```json
"enable_fallback": {
  "type": "toggle",
  "label": "Разрешить резервный шлюз",
  "default": false
}
```

---

## Наследование и переопределение настроек в ядре

В SaviorBill действует двухуровневая модель настроек:
1. **Настройки шаблона скрипта (`ctx.lua.settings`):** общие параметры для всех услуг, использующих этот скрипт (например, глобальный логин и пароль администратора Marzban).
2. **Настройки конкретной услуги (`ctx.service.settings`):** индивидуальные параметры услуги каталога (например, специфический лимит трафика или срок действия тарифа).

В коде скрипта рекомендуется объединять их хелпером с приоритетом настроек услуги:

```lua
local function get_settings(ctx)
  local out = {}
  local tpl = (ctx.lua or {}).settings or {}
  for k, v in pairs(tpl) do out[k] = v end
  local svc = (ctx.service or {}).settings or {}
  for k, v in pairs(svc) do out[k] = v end
  return out
end
```

---

## Описание интерфейса в sbui (`sbuiSDK`)

Помимо параметров админки, манифест может содержать декларативное описание интерфейса для личного кабинета покупателя (`SBPersonalAccountClient`). Для этого используется корневой блок **`sbui`**:

```json
{
  "id": "marzban-vless",
  "name": "Marzban VLESS VPN Delivery",
  "...": "...",
  "sbui": {
    "version": "1.0",
    "title": "VLESS Subscription Card",
    "service_card": {
      "type": "card",
      "variant": "elevated",
      "header": "Подключение VLESS (Xray / Reality)",
      "children": [
        {
          "type": "row",
          "gap": 16,
          "align": "center",
          "children": [
            {
              "type": "qr",
              "value": "{{public.subscription_url}}",
              "size": 130,
              "qrStyle": "liquid",
              "logo": "UNVIDark"
            },
            {
              "type": "column",
              "gap": 8,
              "children": [
                { "type": "text", "variant": "caption", "bold": true, "content": "Ключ подключения:" },
                {
                  "type": "input",
                  "name": "sub_url",
                  "defaultValue": "{{public.subscription_url}}",
                  "readOnly": true
                },
                {
                  "type": "button",
                  "label": "Скопировать ключ",
                  "variant": "primary",
                  "action": "copy"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Ключевые параметры секции `sbui`:
- **`version`** (`"1.0"`): версия протокола схемы разметки;
- **`service_card`**: готовая карточка услуги, которая отображается в личном кабинете покупателя после активации. В значениях полей поддерживается автоматическая подстановка переменных из возвращенной скриптом таблицы `public` через синтаксис `{{public.field_name}}` (например, `{{public.subscription_url}}`);
- **`order_form`** (опционально): кастомная форма выбора параметров на этапе оформления заказа в витрине.

> [!NOTE]
> Полный перечень всех 17 компонентов интерфейса, свойства векторного QR-кода, DatePicker, модальных окон и правила реактивных условий (`depends_on`) подробно описаны в руководстве [Компоненты Server-Driven UI (sbuiSDK)](/ru/docs/sbuisdk-components).

---

## Правила упаковки интеграции

Для публикации интеграции в каталоге или загрузки архивом в админ-панель SaviorBill файлы упаковываются в `.zip` архив со следующей структурой:

```
marzban-vless.zip
├── manifest.json      # Обязательный файл описания
├── service.lua        # Исполняемый Lua-скрипт (или payment.lua / auth.lua)
└── README.md          # Документация и инструкция по запуску
```

Архив должен содержать файлы прямо в корне, без лишней промежуточной папки верхнего уровня.

Пример готового упакованного модуля из каталога Hub:

<div data-hub-card="marzban-vless" data-lang="ru"></div>
