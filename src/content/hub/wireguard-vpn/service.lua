-- SaviorBill Service Integration: WireGuard
-- Handles peer generation and QR rendering for clients

function handle(ctx)
  if ctx.action == "create" then
    -- Request peer from WireGuard panel / API
    local login = ctx.user.login
    local duration_days = ctx.order.tier == "1_year" and 365 or 30

    local config_data = "[Interface]\nPrivateKey = ...\nAddress = 10.0.0.2/24\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = ...\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0\n"

    return {
      public = {
        config = config_data,
        filename = login .. "-wireguard.conf",
        instructions = "Импортируйте конфиг в клиент WireGuard или отсканируйте QR-код."
      },
      private = {
        peer_id = "wg_" .. login
      },
      state = "active",
      expires_at = os.time() + (duration_days * 86400)
    }
  elseif ctx.action == "renew" then
    local duration_days = ctx.order.tier == "1_year" and 365 or 30
    return {
      state = "active",
      expires_at = (ctx.service.expires_at or os.time()) + (duration_days * 86400)
    }
  elseif ctx.action == "delete" then
    -- remove peer API call
    return {
      state = "deleted"
    }
  end
end
