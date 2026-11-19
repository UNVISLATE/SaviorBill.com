---
title: 'Компоненты Server-Driven UI (sbuiSDK)'
description: 'Полный справочник компонентов декларативного рендеринга sbuiSDK: лейаут, типографика, контролы форм, векторный Liquid QR, DatePicker и модальные диалоги.'
category: 'Server-Driven UI (sbuiSDK)'
order: 40
---

## Что такое Server-Driven UI в SaviorBill?

В традиционных биллингах изменение полей заказа, добавление калькуляторов ресурсов или интеграция нового типа услуги требует пересборки и деплоя клиентского фронтенда.

**Server-Driven UI (sbuiSDK)** в корне меняет этот подход:
1. **Декларативное описание:** услуга или плагин выдачи возвращает готовое дерево компонентов интерфейса в виде валидного JSON-манифеста;
2. **Нулевой фронтенд-код:** клиентский личный кабинет (`SBPersonalAccountClient`) мгновенно компилирует JSON в нативные React-компоненты;
3. **Унифицированная палитра:** компоненты автоматически адаптируются под тему платформы (Stealth Dark `#09090b` с фирменным бирюзовым акцентом `#009080`).

![Интерактивная витрина карточек sbuiSDK](/images/docs/sbuisdk-showcase.png)

---

## 1. Компоненты разметки (Layout Primitives)

Служат строительными блоками для построения структуры экранов, адаптивных сеток и карточек.

### `row` (Горизонтальный контейнер)
Строит горизонтальный flex-контейнер с выравниванием элементов.
```json
{
  "type": "row",
  "gap": 16,
  "align": "center",
  "justify": "between",
  "wrap": false,
  "children": [ ... ]
}
```
- **`gap`** (`number | string`): расстояние между дочерними элементами в пикселях.
- **`align`**: `"start" | "center" | "end" | "stretch"`.
- **`justify`**: `"start" | "center" | "end" | "between" | "around"`.

### `column` (Вертикальный контейнер)
Вертикальный flex-стек.
```json
{
  "type": "column",
  "gap": 12,
  "align": "stretch",
  "children": [ ... ]
}
```

### `card` (Карточка-панель)
Базовая панель с закруглёнными углами, фоном и рамкой.
```json
{
  "type": "card",
  "variant": "elevated",
  "header": "Параметры подписки VLESS",
  "padding": "16px",
  "children": [ ... ]
}
```
- **`variant`**: `"default" | "elevated" | "outline" | "ghost"`.

### `grid` (Адаптивная сетка)
CSS Grid контейнер.
```json
{
  "type": "grid",
  "columns": "repeat(auto-fit, minmax(280px, 1fr))",
  "gap": 16,
  "children": [ ... ]
}
```

### `divider` и `space`
- **`divider`**: разделительная линия (`"orientation": "horizontal" | "vertical"`).
- **`space`**: пустой интервал (`"size": 24`).

---

## 2. Типографика и статусы (Typography & Badges)

### `text`
Отображает текстовые блоки различных стилей и иерархии.
```json
{
  "type": "text",
  "content": "Данные защищены протоколом TLS 1.3",
  "variant": "body",
  "bold": true,
  "color": "#a1a1aa",
  "align": "left"
}
```
- **`variant`**: `"h1" | "h2" | "h3" | "h4" | "body" | "caption" | "code" | "muted"`.

### `badge`
Компактный индикатор статуса услуги или тарифа.
```json
{
  "type": "badge",
  "content": "Активен",
  "variant": "success",
  "size": "sm"
}
```
- **`variant`**: `"primary" | "success" | "warning" | "danger" | "neutral"`.

### `alert`
Информационный баннер или предупреждение.
```json
{
  "type": "alert",
  "title": "Внимание",
  "content": "Срок действия подписки истекает через 2 дня.",
  "variant": "warning"
}
```

---

## 3. Специализированные виджеты (Specialized Widgets)

### `qr` (Векторный Liquid QR-код)
Собственный высококачественный генератор векторных QR-кодов с поддержкой закругления углов, плавных капель (Liquid) и центрального брендированного логотипа.

```json
{
  "type": "qr",
  "value": "vless://e83a91b4-42b7-4a0b-8d59-3a3f5a5c7c2e@node.saviorvpn.net:443?...",
  "size": 140,
  "plateRadius": 18,
  "qrStyle": "liquid",
  "logo": "UNVIDark",
  "logoSize": 32,
  "errorCorrection": "M",
  "color": "#ffffff",
  "backgroundColor": "#09090b"
}
```
- **`qrStyle`**: `"liquid"` (плавные округлые капли), `"rounded"` (закруглённые точки) или `"classic"` (квадратные пиксели);
- **`logo`**: встроенные пресеты `"UNVI"`, `"UNVIDark"`, `"UNVILight"` либо произвольный URL SVG-изображения;
- **`plateRadius`**: радиус скругления подложки QR-кода.

### `datepicker` (Выбор даты и времени)
Мощный компонент календаря с поддержкой единичных дат, диапазонов, выбора времени и быстрых пресетов.

```json
{
  "type": "datepicker",
  "name": "booking_slot",
  "label": "Время начала аренды порта",
  "mode": "datetime",
  "minDate": "2026-11-20T00:00:00Z",
  "showPresets": true,
  "required": true
}
```
- **`mode`**: `"date" | "time" | "datetime" | "range"`.

### `dialog` (Модальное диалоговое окно)
Интерактивное всплывающее окно для подробных инструкций или подтверждения действий.
```json
{
  "type": "dialog",
  "dialogId": "vless-instruction",
  "title": "Инструкция по настройке VLESS в v2rayN / Happ",
  "trigger": {
    "type": "button",
    "label": "Открыть инструкцию",
    "variant": "outline"
  },
  "children": [
    {
      "type": "text",
      "content": "1. Скопируйте ключ или отсканируйте QR-код сканером приложения."
    }
  ]
}
```

---

## 4. Элементы ввода форм (Form Controls)

Используются в формах заказа витрины для сбора параметров от клиента перед проведением оплаты.

### `input` и `password`
```json
{
  "type": "input",
  "name": "steam_login",
  "label": "Логин аккаунта Steam",
  "placeholder": "player_login",
  "required": true,
  "validation": {
    "min_length": 3,
    "max_length": 32,
    "regex": "^[a-zA-Z0-9_]+$",
    "regex_error": "Логин может содержать только латиницу, цифры и знак подчёркивания"
  }
}
```

### `number`
Поле для ввода сумм или ползунок калькулятора.
```json
{
  "type": "number",
  "name": "amount_rub",
  "label": "Сумма пополнения (₽)",
  "min": 100,
  "max": 50000,
  "step": 50,
  "defaultValue": 1000,
  "required": true
}
```

### `select`
Выпадающий список опций.
```json
{
  "type": "select",
  "name": "server_location",
  "label": "Локация сервера",
  "default": "nl-ams",
  "options": [
    { "value": "nl-ams", "label": "Нидерланды (Амстердам)" },
    { "value": "de-fra", "label": "Германия (Франкфурт)" },
    { "value": "fi-hel", "label": "Финляндия (Хельсинки)" }
  ]
}
```

### `toggle`
```json
{
  "type": "toggle",
  "name": "auto_renew",
  "label": "Автоматически продлевать с баланса",
  "default": true
}
```

### `button`
```json
{
  "type": "button",
  "label": "Оформить заказ",
  "variant": "primary",
  "action": "submit"
}
```

---

## 5. Условная реактивность (`depends_on`)

Любой компонент `sbuiSDK` может динамически показываться или скрываться в зависимости от значений других полей формы.

Пример: показывать поле ввода токена Telegram только тогда, когда выбран способ доставки `"telegram"`:

```json
{
  "type": "input",
  "name": "telegram_chat_id",
  "label": "ID чата Telegram",
  "required": true,
  "depends_on": {
    "field": "delivery_method",
    "equals": "telegram"
  }
}
```

Также поддерживается проверка по списку вариантов:
```json
"depends_on": {
  "field": "protocol",
  "in": ["vless", "trojan"]
}
```

---

## Практический пример: Карточка выданного VLESS-ключа

Вот как скрипт `service.lua` возвращает манифест Server-Driven UI в поле `public` для рендеринга карточки в личном кабинете покупателя:

```json
{
  "version": "1.0",
  "layout": {
    "type": "card",
    "variant": "elevated",
    "header": "Подключение VLESS (Xray / Reality)",
    "children": [
      {
        "type": "row",
        "justify": "between",
        "align": "center",
        "children": [
          { "type": "text", "variant": "caption", "color": "#a1a1aa", "content": "Frankfurt 🇩🇪 • Порт 443" },
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
            "value": "vless://e83a91b4-42b7-4a0b-8d59-3a3f5a5c7c2e@de.saviorvpn.net:443?security=reality&fp=chrome#SaviorVPN-DE",
            "size": 130,
            "qrStyle": "liquid",
            "logo": "UNVIDark"
          },
          {
            "type": "column",
            "gap": 8,
            "children": [
              { "type": "text", "variant": "caption", "bold": true, "content": "Ключ подключения:" },
              { "type": "input", "name": "key_display", "defaultValue": "vless://e83a91b4-...", "readOnly": true },
              { "type": "button", "label": "Копировать ключ", "variant": "primary", "action": "copy" }
            ]
          }
        ]
      }
    ]
  }
}
```
Клиентский интерфейс рендерит этот JSON без единой строчки дополнительного кода.
