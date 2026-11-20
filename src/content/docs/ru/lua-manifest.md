---
title: 'Спецификация manifest.json для Lua-скриптов'
description: 'Каноническая спецификация манифеста Lua-интеграции SaviorBill: метаданные, типизированные формы настроек settings_form, клиентские формы client_order_form, Server-Driven UI (view_layout) и правила упаковки.'
category: 'Интеграции и Lua'
order: 10
---

## Назначение manifest.json

Каждый Lua-скрипт в SaviorBill (модуль выдачи услуги, эквайринг, OAuth-провайдер или триггер) сопровождается файлом декларативного манифеста `manifest.json`.

Манифест решает ключевые задачи:
1. **Регистрация в ядре биллинга:** определяет уникальный системный слаг (`slug` / `id`), название модуля, категорию, автора и список поддерживаемых событий жизненного цикла (`actions`).
2. **Генерация админ-интерфейса (`settings_form`):** строго упорядоченный массив полей настроек. На основе этой схемы панель администратора SaviorBill автоматически строит интерактивные формы ввода параметров (текст, пароли, переключатели, слайдеры, селекты) с валидацией без необходимости писать фронтенд-код.
3. **Клиентские формы заказа (`client_order_form`):** список полей, которые покупатель заполняет при оформлении заказа в витрине. Ядро биллинга валидирует переданные значения и передает их в Lua-скрипт в `ctx.order.form`.
4. **Server-Driven UI (`view_layout` и `layout`):** декларативное описание карточки выданного сервиса (включая векторные QR-коды, защищенные поля копирования, бейджи) прямо в профиле покупателя.
5. **Управление версиями и фоновыми медиа:** версионирование (`version`), статус стабильности (`status`) и декларативная фоновая загрузка медиаресурсов (`media_download`).

---

## Каноническая структура манифеста

Пример актуального манифеста для интеграции выдачи VPN-подписок:

```json
{
  "slug": "marzban-vless",
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
  "settings_form": [
    {
      "id": "marzban_domain",
      "type": "text",
      "label": "Домен панели Marzban",
      "placeholder": "panel.example.com",
      "required": true,
      "description": "Домен панели без протокола https://"
    },
    {
      "id": "marzban_user",
      "type": "text",
      "label": "Логин администратора",
      "placeholder": "admin",
      "required": true
    },
    {
      "id": "marzban_pass",
      "type": "password",
      "label": "Пароль администратора",
      "required": true
    },
    {
      "id": "data_limit_gb",
      "type": "number",
      "label": "Лимит трафика (ГБ)",
      "default": 0,
      "description": "0 — безлимитный трафик"
    },
    {
      "id": "reset_strategy",
      "type": "select",
      "label": "Стратегия сброса трафика",
      "default": "no_reset",
      "options": [
        { "value": "no_reset", "label": "Без сброса" },
        { "value": "month", "label": "Ежемесячно" },
        { "value": "year", "label": "Ежегодно" }
      ]
    }
  ],
  "view_trigger_label": "Инструкция и QR-код",
  "view_layout": {
    "type": "card",
    "variant": "elevated",
    "content": "Подключение VLESS (Xray / Reality)",
    "children": [
      {
        "type": "row",
        "align": "center",
        "children": [
          { "type": "text", "variant": "caption", "content": "VLESS • Reality • TCP Vision" },
          { "type": "badge", "variant": "success", "content": "Активен" }
        ]
      },
      {
        "type": "row",
        "gap": 16,
        "align": "center",
        "children": [
          {
            "type": "qr",
            "props": {
              "value": "{{public.subscription_url}}",
              "size": 130,
              "plateRadius": 18,
              "qrStyle": "liquid",
              "logo": "UNVIDark"
            }
          },
          {
            "type": "column",
            "gap": 8,
            "children": [
              { "type": "text", "variant": "caption", "content": "Ссылка на подписку:" },
              {
                "type": "copy_field",
                "props": {
                  "value": "{{public.subscription_url}}",
                  "label": "Скопировать ссылку"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Корневые поля манифеста

| Поле | Тип | Обязательное | Описание |
| :--- | :--- | :---: | :--- |
| `slug` | `string` | **Да** | Уникальный системный идентификатор (регулярное выражение `^[a-z0-9_-]+$`). Например: `yookassa-payment`, `marzban-vless`. |
| `id` | `string` | Нет | Алиас для обратной совместимости (рекомендуется указывать равным `slug`). |
| `name` | `string` | **Да** | Человекочитаемое название модуля для отображения в списках и каталоге (до 128 символов). |
| `category` | `string` | **Да** | Категория интеграции: `VPN & Proxies`, `Payments`, `Hosting & Cloud`, `Game Servers`, `Automation`. |
| `author` | `string` | Нет | Автор или студия разработки интеграции. |
| `version` | `string` | **Да** | Версия формата и манифеста (по умолчанию `"1.0"` или SemVer). |
| `status` | `string` | Нет | Статус стабильности модуля: `stable` или `not-stable`. |
| `description` | `string` | Нет | Описание возможностей, протоколов и API интеграции. |
| `actions` | `array<string>` | **Да** | Список действий, поддерживаемых Lua-скриптом (например: `["create", "renew", "stop", "delete", "freeze"]`). |
| `settings_form` | `array<FieldDefinition>` | Нет | Массив полей конфигурации провайдера в панели администратора. |
| `client_order_form` | `array<FieldDefinition>` | Нет | Массив полей заказа, заполняемых покупателем при покупке услуги. |
| `layout` | `SchemaNode` | Нет | Server-Driven UI разметка витрины оформления заказа. |
| `view_layout` | `SchemaNode` | Нет | Server-Driven UI карточка детального просмотра выданной услуги в кабинете клиента. |
| `view_trigger_label` | `string` | Нет | Текст кнопки вызова модального окна просмотра услуги (например, `"Инструкция и QR-код"`). |
| `hide_key` | `boolean` | Нет | Если `true`, скрывает стандартный блок ключа в карточке услуги, оставляя только Server-Driven UI представление. |
| `prefill` | `PrefillConfig` | Нет | Заготовки метаданных (имя услуги, иконка, скоупы) для быстрого создания в SaviorBill. |
| `media_download` | `array<MediaDownloadItem>` | Нет | Список внешних медиа-ресурсов для фонового безопасного скачивания через mediaworker. |

---

## Спецификация полей `FieldDefinition`

Поля в `settings_form` и `client_order_form` описываются массивом объектов. 
> [!NOTE]
> Использование массива гарантирует строго фиксированный порядок полей при отрисовке в интерфейсе.

### Атрибуты поля

| Свойство | Тип | По умолчанию | Описание |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **обязательно** | Ключ поля (`^[a-zA-Z0-9_.-]+$`). Значение передается в Lua: в `ctx.order.form.<id>` для заказов или в `ctx.service.settings[id]` для настроек. |
| `type` | `FieldType` | `"text"` | Тип элемента управления (см. таблицу типов ниже). |
| `label` | `string` | **обязательно** | Заголовок поля в форме. |
| `placeholder` | `string` | `null` | Текст подсказки внутри пустого поля ввода. |
| `description` | `string` | `null` | Пояснительный текст под полем. |
| `required` | `boolean` | `false` | Обязательность заполнения. |
| `default` | `any` | `null` | Значение по умолчанию. |
| `min` / `max` / `step` | `number` | `null` | Ограничения для числовых полей (`number`, `range`). |
| `regex` | `string` | `null` | Регулярное выражение для клиентской и серверной валидации. |
| `regex_error` | `string` | `null` | Текст ошибки при несовпадении с `regex`. |
| `options` | `array` | `null` | Список вариантов выбора для `type: "select"`. Обязателен при `type: "select"`. |
| `depends_on` | `FieldCondition` | `null` | Условие динамической видимости поля в зависимости от других значений формы. |

---

## Поддерживаемые типы `type`

### 1. Текстовое поле (`text`)
Однострочное поле ввода.
```json
{
  "id": "hostname",
  "type": "text",
  "label": "Хост сервера",
  "placeholder": "node1.vpn.internal",
  "required": true,
  "description": "IP-адрес или доменное имя ноды"
}
```

### 2. Секретный пароль или токен (`password`)
Маскируемое поле ввода. Значение в базе данных SaviorBill надёжно шифруется.
```json
{
  "id": "api_token",
  "type": "password",
  "label": "Секретный токен API",
  "required": true
}
```

### 3. Числовое значение (`number`)
Ввод целых или дробных чисел с возможностью ограничения диапазона:
```json
{
  "id": "port",
  "type": "number",
  "label": "Порт подключения",
  "default": 443,
  "min": 1,
  "max": 65535,
  "required": true
}
```

### 4. Ползунок диапазона (`range`)
Слайдер для удобного выбора числа:
```json
{
  "id": "cpu_cores",
  "type": "range",
  "label": "Количество ядер vCPU",
  "default": 2,
  "min": 1,
  "max": 16,
  "step": 1
}
```

### 5. Выпадающий список (`select`)
Выбор значения из списка вариантов. Каждый элемент `options` содержит `value` и `label` (и опционально `price_delta`):
```json
{
  "id": "location",
  "type": "select",
  "label": "Локация сервера",
  "default": "nl",
  "options": [
    { "value": "nl", "label": "Амстердам (Нидерланды)" },
    { "value": "de", "label": "Франкфурт (Германия)" },
    { "value": "fi", "label": "Хельсинки (Финляндия)", "price_delta": "50.00" }
  ]
}
```

### 6. Переключатель (`toggle`)
Логический переключатель (булево значение `true` / `false`):
```json
{
  "id": "send_receipt",
  "type": "toggle",
  "label": "Формировать чек по 54-ФЗ",
  "default": false,
  "description": "Включите, если подключена онлайн-касса"
}
```

### 7. Многострочный текст (`textarea`)
Поле для ввода больших объемов текста, SSH-ключей, конфигов или сертификатов:
```json
{
  "id": "public_key",
  "type": "textarea",
  "label": "Публичный SSH-ключ",
  "placeholder": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5..."
}
```

### 8. Дата и время (`datetime`)
Поле выбора даты и времени для планирования или расписаний.

---

## Реактивные условия видимости (`depends_on`)

Поля могут динамически отображаться или скрываться в зависимости от значений других полей формы:

```json
{
  "id": "vat_code",
  "type": "select",
  "label": "Ставка НДС",
  "default": "1",
  "options": [
    { "value": "1", "label": "1 — Без НДС" },
    { "value": "4", "label": "4 — НДС 20%" }
  ],
  "depends_on": {
    "field": "send_receipt",
    "equals": true
  }
}
```

Поддерживаемые операторы условий `FieldCondition`:
- `equals`: значение должно быть строго равно указанному;
- `not_equals`: значение не должно быть равно указанному;
- `in`: значение должно входить в переданный список;
- `not_in`: значение не должно входить в список.

---

## Доступ к настройкам в Lua-скриптах

### Настройки провайдера и услуги
В SaviorBill действует двухуровневая модель настроек:
1. **Настройки шаблона скрипта (`ctx.lua.settings`):** глобальные параметры (например, адрес панели Marzban или секретный ключ API эквайринга).
2. **Настройки конкретной услуги (`ctx.service.settings`):** параметры конкретной позиции тарифа (например, лимит трафика или предустановленная скорость).

Для удобного объединения в скрипте:
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

### Пользовательские поля заказа (`client_order_form`)
Значения полей, заполненных покупателем в форме заказа, передаются в таблицу `ctx.order.form`:
```lua
function M.handle(ctx)
  if ctx.action == "create" then
    local client_os = ctx.order.form.os_type or "ubuntu-24.04"
    local ssh_key = ctx.order.form.ssh_public_key
    -- ...
  end
end
```

---

## Server-Driven UI в личном кабинете (`view_layout`)

Для отображения инструкций, выданных данных и интерактивных элементов используется секция `view_layout` и свойство `view_trigger_label`.

Манифест объявляет дерево `SchemaNode` непосредственно в корне манифеста:

```json
{
  "view_trigger_label": "Инструкция и QR-код",
  "view_layout": {
    "type": "card",
    "variant": "elevated",
    "content": "Данные для подключения",
    "children": [
      {
        "type": "qr",
        "props": {
          "value": "{{public.subscription_url}}",
          "size": 140,
          "plateRadius": 16,
          "qrStyle": "liquid",
          "logo": "UNVIDark"
        }
      },
      {
        "type": "copy_field",
        "props": {
          "value": "{{public.subscription_url}}",
          "label": "Скопировать ссылку подписки"
        }
      }
    ]
  }
}
```

### Ключевые возможности:
- **Интерполяция `{{public.field_name}}`:** ядро автоматически подставляет в свойства компонентов значения из публичной таблицы `public`, которую вернул скрипт при создании услуги (`return { success = true, public = { subscription_url = "..." } }`).
- **Скрытие сырого ключа (`hide_key: true`):** если услуга оформлена через кастомный `view_layout`, отображение стандартного блока технического ключа можно отключить.
- Полный справочник по доступным компонентам (`row`, `column`, `grid`, `qr`, `copy_field`, `badge` и др.) доступен в документе [Компоненты Server-Driven UI (sbuiSDK)](/ru/docs/sbuisdk-components).

---

## Правила упаковки интеграции

Для публикации интеграции в каталоге Hub или импорта архивом в панель управления файлы упаковываются в `.zip` архив со следующей структурой:

```
marzban-vless.zip
├── manifest.json      # Обязательный манифест
├── service.lua        # Исполняемый Lua-скрипт (или payment.lua / auth.lua)
└── README.md          # Описание интеграции
```

Файлы архива должны располагаться строго в корне, без вложенной папки верхнего уровня.

Пример готового упакованного модуля из каталога Hub:

<div data-hub-card="marzban-vless" data-lang="ru"></div>
