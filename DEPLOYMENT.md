# Deploying Podio MCP Server (e.g. podiomcp.bitkit.dk)

This guide covers deploying the Podio MCP server so it is reachable over HTTP/SSE at a URL like `https://podiomcp.bitkit.dk` for remote clients (Cursor, MCP Inspector, etc.).

## Overview

- **Local (stdio)**: Cursor runs the server as a subprocess and talks over stdin/stdout. No deployment.
- **Remote (HTTP/SSE)**: The server runs as an HTTP app and exposes:
  - `GET /sse` – establish MCP session (Server-Sent Events)
  - `POST /message?sessionId=...` – send MCP messages (used by client after connecting to `/sse`)
  - `GET /health` – health check

To make it accessible at **podiomcp.bitkit.dk**, you run the server in HTTP mode and put a reverse proxy (e.g. Nginx or Caddy) in front with TLS.

---

## 1. Prerequisites on the server

- **Node.js 18+** (recommend LTS)
- **Reverse proxy** (Nginx or Caddy) for TLS and optional auth
- **Domain** `podiomcp.bitkit.dk` pointing to the server (DNS A/AAAA)

---

## 2. Build and run the app (HTTP mode)

On the host that will serve `podiomcp.bitkit.dk`:

```bash
# Clone the repo (or copy the project)
cd /path/to/mcp-server-for-podio

# Install dependencies and build
npm ci
npm run build

# Run in HTTP mode
PORT=3016 node dist/index.js
```

Or:

```bash
npm run start:http
```

This starts the server on port **3016** by default in Docker, or **3000** via `npm run start:http` (override with `PORT`). By default it binds to **127.0.0.1** so only the same host (e.g. Nginx/Caddy) can reach it. Set `BIND_ADDRESS=0.0.0.0` if you need to listen on all interfaces.

### Docker

```bash
docker build -t mcp-server-for-podio .
docker run --rm -p 3016:3016 \
  -v /path/to/podio.config.json:/app/podio.config.json:ro \
  -e PORT=3016 \
  mcp-server-for-podio
```

For production, run under a process manager so it restarts on crash and starts on boot.

### Option A: systemd

Create `/etc/systemd/system/podio-mcp.service`:

```ini
[Unit]
Description=Podio MCP Server (HTTP/SSE)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html/AI/podio_mcp_server
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable podio-mcp
sudo systemctl start podio-mcp
sudo systemctl status podio-mcp
```

### Option B: PM2

```bash
npm install -g pm2
cd /var/www/html/AI/podio_mcp_server
PORT=3000 pm2 start dist/index.js --name podio-mcp
pm2 save
pm2 startup   # follow the command it prints to enable on boot
```

---

## 3. Reverse proxy and TLS (podiomcp.bitkit.dk)

The app speaks HTTP. To expose it at **https://podiomcp.bitkit.dk** you need:

1. **TLS** (HTTPS) – required for production and for many MCP clients.
2. **Proxy** from port 443 (and optionally 80 → 443) to `http://127.0.0.1:3000`.

### Nginx

Example server block (adjust paths and server name if needed):

```nginx
# Redirect HTTP -> HTTPS
server {
    listen 80;
    server_name podiomcp.bitkit.dk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name podiomcp.bitkit.dk;

    # TLS (use your cert paths; e.g. Let's Encrypt)
    ssl_certificate     /etc/letsencrypt/live/podiomcp.bitkit.dk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/podiomcp.bitkit.dk/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 86400;
        chunked_transfer_encoding off;
    }
}
```

Reload Nginx after editing:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Caddy

Caddy can obtain and renew TLS automatically:

```text
podiomcp.bitkit.dk {
    reverse_proxy 127.0.0.1:3000
}
```

Reload Caddy after changing config (e.g. `sudo systemctl reload caddy`).

---

## 4. TLS certificate (e.g. Let's Encrypt)

If you use Nginx and don’t have a cert yet:

```bash
# Certbot (adjust for your OS)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d podiomcp.bitkit.dk
```

For Caddy, TLS is handled automatically once the domain points to the server.

---

## 5. Config and secrets on the server

- **Podio credentials** are read from `podio.config.json` in the project root (same as local use). Create or copy this file on the server and restrict permissions:

  ```bash
  chmod 600 /var/www/html/AI/podio_mcp_server/podio.config.json
  ```

- Do **not** commit `podio.config.json` (it’s in `.gitignore`). For deployment you can:
  - Copy it manually, or
  - Use a secrets manager and write the file at deploy time.

---

## 6. Optional: authentication

The MCP protocol does not define HTTP auth. If you want to protect the endpoint:

- Put **HTTP Basic Auth** or a **bearer token** in the reverse proxy (Nginx/Caddy), or
- Add a small auth layer in the app (e.g. check a header or query param before handling `/sse` and `/message`).

If you add auth, clients must send the same credentials when connecting to `https://podiomcp.bitkit.dk/sse` and when POSTing to `/message`.

---

## 7. Connect a client to the remote server

Once the server is reachable at `https://podiomcp.bitkit.dk`:

- **MCP Inspector**: Use the URL `https://podiomcp.bitkit.dk/sse` as the server URL (Streamable HTTP / SSE).
- **Cursor (remote MCP)**:
  - In MCP settings, add a remote server with URL `https://podiomcp.bitkit.dk/sse` (or the transport URL your client expects).
  - If you added auth, configure the client to send the same credentials.

---

## 8. Checklist for podiomcp.bitkit.dk

1. [ ] DNS: `podiomcp.bitkit.dk` → your server’s IP.
2. [ ] Node 18+ and project: `npm ci && npm run build`.
3. [ ] `podio.config.json` on server (and correct permissions).
4. [ ] Run app in HTTP mode: `PORT=3000 node dist/index.js` (or systemd/PM2).
5. [ ] Reverse proxy: Nginx or Caddy proxying `https://podiomcp.bitkit.dk` → `http://127.0.0.1:3000`.
6. [ ] TLS in place (e.g. Let’s Encrypt or Caddy auto).
7. [ ] Optional: auth and firewall (e.g. allow 80/443 only).
8. [ ] Test: `curl -s https://podiomcp.bitkit.dk/health` and connect with MCP Inspector or Cursor.

---

## 9. Troubleshooting

- **502 Bad Gateway**: App not running or not listening on the port the proxy uses (e.g. 3000). Check `systemctl status podio-mcp` or `pm2 list` and logs.
- **404 on /message**: Usually a session problem (wrong or missing `sessionId`). Ensure the client first connects to `/sse` and uses the endpoint + `sessionId` returned in the SSE event for subsequent POSTs.
- **Connection drops**: Long-lived SSE may need larger timeouts in the proxy (see `proxy_read_timeout` in the Nginx example).
- **Config errors**: Ensure `podio.config.json` exists and has valid `clientId` / `clientSecret`; check app logs.

For local (stdio) mode, do **not** set `PORT`; Cursor will start the server and use stdio automatically.
