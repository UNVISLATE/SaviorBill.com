# CryptoBot (CryptoPay API) Payment Gateway

Официальная интеграция платёжного шлюза **CryptoBot** (@CryptoBot / @CryptoTestnetBot) для платформы SaviorBill.

Позволяет принимать оплату в криптовалюте (USDT, TON, BTC, ETH, LTC, TRX) как в нативном Telegram Mini App, так и через браузерную веб-ссылку с автоматической конвертацией фиатных цен (RUB, USD, EUR) в крипту.

---

### Поддерживаемые действия:
- `create` — генерация инвойса через CryptoPay API (`createInvoice`) со ссылкой на оплату в Telegram (`mini_app_invoice_url` / `web_app_invoice_url`).
- `callback` — приём и криптографическая проверка вебхуков `invoice_paid` по алгоритму HMAC-SHA256 в соответствии с [официальной документацией CryptoPay](https://help.cr.bot/ru/articles/10279948-crypto-pay-api).
- `check` — периодическая проверка статуса незавершённых счетов через метод `getInvoices`.

---

### Настройки интеграции:
1. **`api_token`** — API-токен приложения из бота `@CryptoBot` (команда `/pay` → *Create App* → *API Token*).
2. **`network`** — выбор сети: `mainnet` (реальные средства) или `testnet` (для отладки через `@CryptoTestnetBot`).
3. **`currency_type`** — базовая валюта тарифов:
   - `fiat` — цены в рублях/долларах, покупатель выбирает удобную монету при оплате.
   - `crypto` — прямой расчет в криптовалюте (например, фиксированные USDT).
4. **`accepted_assets`** — перечень разрешенных к оплате монет (`USDT,TON,BTC,ETH,LTC,TRX`).

---

### Настройка Webhook в @CryptoBot:
1. В боте `@CryptoBot` перейдите в `/pay` → выберите ваше приложение → **Webhooks**.
2. Включите вебхуки и укажите URL:  
   `https://billing.example.com/api/v1/payments/callback/cryptobot-payment`
3. Убедитесь, что бот присылает событие `invoice_paid`.
