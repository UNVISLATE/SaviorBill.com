-- SaviorBill Payment Gateway: YooKassa
-- Handles invoice creation, webhook callback, and background billing loops

function handle(ctx)
  if ctx.action == "create" then
    local shop_id = ctx.payment.provider_data.secrets.shop_id
    local secret_key = ctx.payment.provider_data.secrets.secret_key
    
    -- Request payment link from YooKassa API
    return {
      payment_url = "https://yoomoney.ru/checkout/payments/v2/contract?orderId=" .. ctx.payment.id,
      external_id = "yk_" .. ctx.payment.id,
      status = "pending"
    }
  elseif ctx.action == "callback" then
    -- Process incoming webhook JSON
    local payload = ctx.request.json
    if payload.event == "payment.succeeded" then
      return {
        external_id = payload.object.id,
        status = "paid"
      }
    end
    return { status = "pending" }
  end
end
