# DevOps Bootcamp Final Project — "Dua Belas Keluarga, Satu Sistem"

End-to-end AWS infrastructure provisioned with **Terraform**, configured with **Ansible**, and monitored via **Prometheus/Grafana** — built as the final project for Infratify's DevOps Bootcamp 2026.

## Live Links

| Resource | URL |
|---|---|
| **Application** | [http://web.melolu.com](http://web.melolu.com) |
| **Monitoring Dashboard** | [http://monitoring.melolu.com](http://monitoring.melolu.com) |
| **Repository** | [https://github.com/larkinss/devops-bootcamp-project](https://github.com/larkinss/devops-bootcamp-project) |

## Architecture

AWS ap-southeast-1, VPC devops-vpc (10.0.0.0/24):

- **Public subnet (10.0.0.0/25):** web-server (10.0.0.5) — Elastic IP, Docker app container (port 80), node_exporter (port 9100)
- **Private subnet (10.0.0.128/25):**
  - controller (10.0.0.135) — Ansible control node
  - monitoring (10.0.0.136) — Prometheus, Grafana, cloudflared
- Shared: NAT Gateway, Internet Gateway, S3 (Terraform state + SSM transfer)

DNS: `web.melolu.com` points directly to the web server's Elastic IP. `monitoring.melolu.com` reaches Grafana through an outbound-only Cloudflare Tunnel from the monitoring server, which has no public IP.

**Access model:** All 3 EC2 instances are managed exclusively via AWS SSM Session Manager — no SSH bastion, no public SSH access. Ansible connects to targets using the `aws_ssm` connection plugin instead of SSH.

## Repo Structure

- `app/` — Application source (Vite + Three.js spaceship microsite)
- `terraform/` — Infrastructure as Code (VPC, EC2, IAM, S3, ECR)
- `ansible/` — Configuration management (Docker, monitoring stack, app deploy)
- `.github/` — CI/CD workflow (GitHub Pages publish)

## What Was Built

### Phase 1 — Infrastructure Provisioning (Terraform)
- VPC with public/private subnets, NAT Gateway, Internet Gateway
- 3 EC2 instances (web server, Ansible controller, monitoring server)
- Security groups scoped to least-privilege (port 80 public, port 9100 restricted to monitoring server only, port 22 VPC-internal only)
- S3 backend for remote Terraform state
- IAM role + SSM instance profile on all instances (no public SSH)

### Phase 2 — Configuration Management (Ansible)
- Ansible controller connects to targets via SSM connection plugin (no port 22 used at all)
- Docker installed via the `geerlingguy.docker` Galaxy role
- Application built as a multi-stage Docker image, pushed to a private ECR repository (auth via IAM instance role, no static credentials)
- Application deployed as a container on the web server (port 80)
- All playbooks verified idempotent (safe to re-run, `changed=0` on second run)

### Phase 3 — Monitoring & Observability
- `node_exporter` running on the web server, scraped by Prometheus
- Prometheus deployed as a container on the monitoring server, config delivered via bind mount
- Grafana deployed as a container, dashboard and datasource auto-provisioned (no manual UI setup)
- Custom dashboard: CPU, Memory, and Disk usage panels for the web server

### Phase 4 — Domain & Secure Access
- `web.melolu.com` — direct DNS A record to the web server's Elastic IP
- `monitoring.melolu.com` — Cloudflare Tunnel to Grafana (port 3000) on the monitoring server
- Monitoring server has no public IP and no inbound ports open — the tunnel is a fully outbound-only connection
- Cloudflare SSL/TLS mode: Flexible

### Phase 5 — Documentation
- This README, published via GitHub Pages
- GitHub Actions workflow to auto-publish the Pages site on every push to `main`

## Tech Stack

Terraform, Ansible, Docker, AWS (VPC, EC2, S3, ECR, IAM, SSM), Prometheus, Grafana, Cloudflare (DNS + Tunnel), GitHub Actions

## Setup Steps (Summary)

1. Repo & Terraform backend — S3 bucket for remote state, bootstrapped with local state first
2. Networking — VPC, subnets, route tables, IGW, NAT Gateway
3. Security groups — public/private, scoped per the access matrix above
4. EC2 instances — 3 servers with SSM instance profiles and a generated SSH key pair (used only for initial bootstrap; day-to-day access is SSM-only)
5. Ansible setup — controller configured with `amazon.aws`/`community.docker` collections and the SSM connection plugin
6. Docker + app deploy — Docker installed via Galaxy role, app image built/pushed to ECR, deployed as a container
7. Monitoring stack — node_exporter, Prometheus, Grafana deployed via Ansible-managed Docker Compose, dashboard auto-provisioned
8. Domain & Tunnel — Cloudflare DNS record for the app, Cloudflare Tunnel for the monitoring dashboard
9. Documentation — this README, GitHub Pages, GitHub Actions

## Security Notes

- No SSH bastion host; all administrative access via SSM Session Manager
- Ansible-to-target connections use SSM, not SSH (port 22 closed to external traffic entirely)
- Monitoring server has no public IP and is unreachable except via the Cloudflare Tunnel
- ECR authentication uses IAM instance roles, not static AWS credentials
- Terraform state stored encrypted in S3 with versioning and public access blocked

---

Built for Infratify DevOps Bootcamp 2026.
