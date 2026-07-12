# Sendkit

A toolkit for sending Telegram bot messages. Provides a CLI, a local MCP server (stdio), and a remote MCP server (HTTP) — all powered by a shared core library.

## Packages

Published on npm under the `@sr_telekit` scope:

| Package | npm | Description |
|---|---|---|
| `@sr_telekit/sendkit-core` | [![npm](https://img.shields.io/npm/v/@sr_telekit/sendkit-core)](https://www.npmjs.com/package/@sr_telekit/sendkit-core) | Shared core library — Telegram message sending logic and Zod schemas |
| `@sr_telekit/sendkit` | [![npm](https://img.shields.io/npm/v/@sr_telekit/sendkit)](https://www.npmjs.com/package/@sr_telekit/sendkit) | CLI tool — `telekit` binary for sending messages from the terminal |
| `@sr_telekit/sendkit-mcp` | [![npm](https://img.shields.io/npm/v/@sr_telekit/sendkit-mcp)](https://www.npmjs.com/package/@sr_telekit/sendkit-mcp) | Local MCP server — stdio transport for AI agents |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Interfaces                      │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │   CLI    │  │ Local MCP  │  │ Remote MCP │  │
│  │ (telekit)│  │  (stdio)   │  │ (HTTP)     │  │
│  └────┬─────┘  └─────┬──────┘  └─────┬──────┘  │
│       └──────────────┼───────────────┘          │
│              ┌───────▼───────┐                  │
│              │ sendkit-core  │                  │
│              │ (schemas +    │                  │
│              │  operation)   │                  │
│              └───────┬───────┘                  │
│              ┌───────▼───────┐                  │
│              │ Telegram Bot  │                  │
│              │ API (REST)    │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

All interfaces share the same `sendTelegramMessage()` function and Zod schemas from `sendkit-core`. Input and API responses are validated end-to-end using Zod.

## Quick Start

### Install

```bash
bun install
```

### CLI (`telekit`)

```bash
# One-time setup: save your bot token
telekit init --telegram-bot-token "YOUR_BOT_TOKEN"

# Send a message
telekit telegram <chatId> "Hello from sendkit"
```

The bot token is stored at `~/.config/sendkit/config.json` with restricted permissions (`0600`).

### Local MCP Server

```bash
# With bot token as environment variable
TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN" telekit-mcp
```

Or run via npx/bunx:

```bash
bunx @sr_telekit/sendkit-mcp
```

The MCP server registers a single tool called `telegram` with two parameters:
- `chatId` (string) — Telegram chat ID
- `message` (string) — Message text

Returns `{ ok: true, messageId: number, chatId: string }`.

### Remote MCP Server (app)

The remote MCP server (`apps/remote-mcp`) runs over HTTP with Clerk authentication. It is not published to npm.

```bash
PORT=3000 \
CLERK_PUBLISHABLE_KEY="..." \
CLERK_SECRET_KEY="..." \
bun run apps/remote-mcp/src/index.ts
```

## Development

### Build

Build core first (other packages depend on it):

```bash
bun run build:core
bun run build:cli
bun run build:local-mcp
```

### Type Check

```bash
bun run typecheck
```

### Lint & Format

```bash
bun run lint
bun run format
```

### Run in Dev Mode

```bash
bun run dev:cli
bun run dev:local-mcp
bun run dev:remote-mcp
```

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | local-mcp | Telegram bot API token (from [BotFather](https://t.me/BotFather)) |
| `CLERK_PUBLISHABLE_KEY` | remote-mcp | Clerk authentication publishable key |
| `CLERK_SECRET_KEY` | remote-mcp | Clerk authentication secret key |
| `PORT` | remote-mcp | HTTP server port (default: `3000`) |

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Language:** TypeScript (strict, ES2022 target)
- **Build:** [tsdown](https://github.com/nicolo-ribaudo/tsdown) (ESM, DTS, Node 20 target)
- **Validation:** [Zod](https://zod.dev) v4
- **CLI:** [Commander](https://github.com/tj/commander.js)
- **MCP:** [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **HTTP (remote):** [Hono](https://hono.dev) + [Clerk](https://clerk.com)
- **Linting:** [oxlint](https://oxc-project.github.io/)
- **Formatting:** [oxfmt](https://oxc-project.github.io/)

## Project Structure

```
sendkit/
├── apps/
│   └── remote-mcp/         # Remote MCP server (HTTP, private)
├── packages/
│   ├── core/               # @sr_telekit/sendkit-core
│   ├── cli/                # @sr_telekit/sendkit
│   └── local-mcp/          # @sr_telekit/sendkit-mcp
├── skills/
│   └── sendkit/            # AI agent skill definition
├── package.json            # Workspace root
├── tsconfig.json           # Shared TypeScript config
└── readme.md
```