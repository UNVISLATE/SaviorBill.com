#!/usr/bin/env bash
# SaviorBill Quick Installation Script
set -e

echo "[SaviorBill] Checking system dependencies..."
curl -fsSL https://get.docker.com | sh
echo "[SaviorBill] Downloading Docker Compose bundle..."
mkdir -p /opt/saviorbill && cd /opt/saviorbill
curl -fsSL https://raw.githubusercontent.com/UNVISLATE/SaviorBill/master/docker-compose.yml -o docker-compose.yml
echo "[SaviorBill] Ready. Run: docker compose up -d"
