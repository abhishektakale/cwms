# CWMS Path A — one VM, full Docker stack (Postgres + MinIO + API + SPA)
#
# Testers open: https://YOUR_DOMAIN
# No Neon / R2 / Pages required.

## What runs

| Container | Role | Public? |
|-----------|------|---------|
| `frontend` | SPA + `/api` proxy | via Caddy → `:8080` |
| `backend` | Nest API | internal (+ optional `:3000` for debug) |
| `postgres` | DB | **no** (internal only in UAT compose) |
| `minio` | Files | **no** (internal only) |

## 1. Get a VM

- Ubuntu 22.04+, 1–2 GB RAM minimum (2 GB safer)
- Public IP
- Open firewall: **22** (SSH), **80**, **443**
- Point DNS: `A` record `YOUR_DOMAIN` → VM IP  
  Examples: `cwms-uat.yourdomain.com`, or a free subdomain from DuckDNS / FreeDNS

## 2. Install Docker + Caddy (on the VM)

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out/in, then:
docker version

# Caddy (HTTPS)
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 3. Clone and configure

```bash
git clone https://github.com/abhishektakale/cwms.git
cd cwms
cp deploy/path-a/.env.uat.example deploy/path-a/.env.uat
nano deploy/path-a/.env.uat   # set strong passwords + YOUR_DOMAIN
```

## 4. Start the app

```bash
docker compose \
  -f deploy/docker/docker-compose.yml \
  -f deploy/path-a/docker-compose.uat.yml \
  --env-file deploy/path-a/.env.uat \
  up -d --build
```

Check:

```bash
docker compose -f deploy/docker/docker-compose.yml -f deploy/path-a/docker-compose.uat.yml ps
curl -s http://127.0.0.1:8080/api/v1/health
```

## 5. HTTPS with Caddy

```bash
sudo cp deploy/path-a/Caddyfile /etc/caddy/Caddyfile
# edit: replace YOUR_DOMAIN
sudo nano /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Testers: **https://YOUR_DOMAIN**  
Login: `Administrator` / `Password@123` (change after first login if the URL is shared widely)

## 6. Updates later

```bash
cd ~/cwms   # or your clone path
git pull
docker compose \
  -f deploy/docker/docker-compose.yml \
  -f deploy/path-a/docker-compose.uat.yml \
  --env-file deploy/path-a/.env.uat \
  up -d --build
```

## 7. Stop

```bash
docker compose \
  -f deploy/docker/docker-compose.yml \
  -f deploy/path-a/docker-compose.uat.yml \
  --env-file deploy/path-a/.env.uat \
  down
```

(Data stays in Docker volumes unless you add `-v`.)

## Security checklist

- [ ] Strong `POSTGRES_PASSWORD` / `MINIO` passwords in `.env.uat` (not the dev defaults)
- [ ] `.env.uat` never committed (gitignored)
- [ ] Postgres / MinIO ports not published on the public internet (UAT override removes them)
- [ ] HTTPS working before sharing the link (cookies use `Secure` in production)
- [ ] Demo password changed if link is not private

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Caddy certificate fail | DNS not pointing at VM yet; wait for A record |
| Health down | `docker compose ... logs backend` |
| 502 from Caddy | App not up on `:8080` — check `docker ps` |
| Login cookie issues | Use https:// domain (not raw http://IP) with `COOKIE_SECURE=true` |
