# CyberPulse-AVA

> Your Personal Cyber Security Command Centre

CyberPulse-AVA is a Microsoft-integrated cybersecurity companion platform that gives every employee a personalised security command centre. It combines CyberScore analytics, device compliance monitoring, threat intelligence, security awareness training, and AI-powered guidance from AVA to improve cyber resilience through engagement, visibility, and actionable insights.

## Vision

Most security platforms are built for SOC analysts. CyberPulse-AVA is built for everyone.

The goal is to transform cybersecurity from a reactive IT function into an engaging experience that helps employees understand, improve, and take ownership of their personal security posture.

## Key Benefits

### For Employees

- View a personal CyberScore
- Monitor device compliance
- Track security awareness progress
- Receive actionable security recommendations
- Chat with AVA, the AI Security Assistant
- Stay informed about threats affecting their security profile

### For Security Teams

- Improve organisational security engagement
- Measure cyber awareness adoption
- Monitor user risk exposure
- Track device compliance
- Support security culture initiatives
- Centralise security visibility

### For Leadership

- Improve cyber maturity
- Increase employee participation
- Reduce security risk
- Demonstrate compliance readiness
- Measure programme effectiveness

## Core Features

### CyberScore™

CyberScore provides a simple way for users to understand their current cybersecurity posture. Score categories include Identity Security, Device Compliance, Security Awareness, and Risk Exposure. Users can track trends over time and receive personalised recommendations for improvement.

### Device Compliance Centre

View security and compliance information for managed devices, including device health, encryption, antivirus, firewall status, compliance policies, and non-compliance reasons. Supported platforms include Windows, macOS, iOS, and Android.

### Security Alert Feed

A central location for security alerts affecting users and devices, with severity prioritisation, alert filtering, resolution workflows, security context, and threat investigation assistance.

### AVA AI Security Assistant

AVA is CyberPulse's intelligent security assistant. It can explain security alerts, provide remediation guidance, answer cybersecurity questions, support security awareness, recommend improvements, and assist with incident investigations. Current development builds use mocked responses and are designed for future Microsoft Copilot Studio integration.

### Threat Intelligence Dashboard

CyberPulse consolidates intelligence from multiple security sources, including Darktrace and Pentera. This includes threat scores, anomalous devices, AI confidence levels, MITRE ATT&CK mapping, incident visibility, vulnerability findings, attack surface analysis, risk ratings, CVSS scoring, and remediation priorities.

### Security Learning Hub

A security awareness and training platform with learning modules, progress tracking, mandatory training, leaderboards, completion statistics, and security education resources.

### Microsoft Security Integration

CyberPulse-AVA is designed to integrate with Microsoft's security ecosystem, including Microsoft Entra ID, Microsoft Intune, Microsoft Defender, Microsoft Graph, and Microsoft Teams.

## Platform Architecture

```text
┌─────────────────────────────────────┐
│              Employee               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│         CyberPulse Web App          │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           API & Services            │
├─────────────────────────────────────┤
│ AVA Security Assistant              │
│ CyberScore Engine                   │
│ Device Compliance Engine            │
│ Security Learning Platform          │
│ Threat Intelligence Engine          │
│ Microsoft Integration Layer         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             PostgreSQL              │
└─────────────────────────────────────┘
```

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion
- Wouter
- next-themes

### Backend

- Node.js
- Express
- TypeScript
- Zod Validation

### Data and API

- PostgreSQL
- Drizzle ORM
- OpenAPI
- Orval code generation
- Generated TypeScript clients

### Tooling

- PNPM workspaces
- TypeScript 5
- esbuild

## Repository Structure

```text
CyberPulse-AVA/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── db/
│   ├── api-spec/
│   ├── integrations/
│   └── api-client-react/
├── docs/
├── assets/
├── scripts/
├── teams-manifest/
├── README.md
├── ROADMAP.md
├── SECURITY.md
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 24+
- PNPM
- PostgreSQL

### Installation

```bash
git clone https://github.com/norberto999/CyberPulse-AVA.git
cd CyberPulse-AVA
pnpm install
```

### Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

Required variables include:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/cyberpulse
```

### Run the Development Environment

Backend:

```bash
pnpm --filter @workspace/api-server run dev
```

Frontend:

```bash
pnpm --filter @workspace/cyberpulse-ava run dev
```

### Useful Commands

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
```

## Development Status

Development and demo environments currently use seeded sample data for Microsoft Entra ID, Microsoft Intune, Microsoft Defender, Darktrace, and Pentera. The architecture is designed for these integrations to be replaced with live API connectivity in production environments.

## Product Roadmap

### Phase 1

- Core Dashboard
- CyberScore
- Device Compliance
- Security Alerts
- Learning Hub

### Phase 2

- Microsoft Integration
- Teams Notifications
- Entra ID Authentication
- Defender Integration
- Intune Integration

### Phase 3

- AVA with Copilot Studio
- AI Security Recommendations
- Intelligent Risk Analysis
- Incident Summarisation

### Phase 4

- Automated Remediation
- Advanced Threat Hunting
- Executive Dashboards
- Enterprise Reporting

---

# Security

Security vulnerabilities should be reported privately.

Please review:

```text
SECURITY.md
```

before submitting a report.

---

# Contributing

Contributions, feature requests, and improvements are welcome.

Please review:

```text
CONTRIBUTING.md
```

before opening a Pull Request.

---

# License

MIT License

---

## CyberPulse-AVA

**Empowering every employee to become an active participant in cyber security.**



## Repository structure

- apps/web — React/Vite frontend for the user experience
- apps/api — Express API server for routes and business logic
- packages/db — Drizzle schema and database helpers
- packages/api-spec — OpenAPI contract source
- packages/api-client-react — generated React API client
- packages/integrations — Microsoft and security integrations
- docs — architecture, deployment, and product documentation
- assets — branding and screenshots
- scripts — maintenance and automation helpers

## Quick start

1. Install dependencies with pnpm
   - pnpm install
2. Start the API
   - pnpm --filter @workspace/api-server run dev
3. Start the web app
   - pnpm --filter @workspace/cyberpulse-ava run dev

## Development commands

- pnpm run typecheck
- pnpm run build
- pnpm --filter @workspace/api-spec run codegen
- pnpm --filter @workspace/db run push

## Environment

Set the following environment variable before running the API:

- DATABASE_URL

## Documentation

See the docs folder for architecture, deployment, integration, and roadmap references.

## License

MIT
