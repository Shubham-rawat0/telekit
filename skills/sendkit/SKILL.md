---
name: sendkit
description: >
  Send Telegram messages using the sendkit toolset. Use this skill whenever a user asks to send a
  Telegram message, notify someone via Telegram, or interact with the sendkit MCP tool or CLI.
  Covers both the sendkit MCP tool (preferred) and the telekit CLI fallback. Also use when the
  user wants to verify sendkit is working, test a Telegram bot, or choose between MCP and CLI
  workflows.
---

# Sendkit Skill

Sendkit is a toolkit for sending Telegram bot messages. It exposes two interfaces: an MCP tool (for
agents) and a CLI (`telekit`) for manual or fallback use.

## When to use

- User asks to send a message via Telegram
- User wants to verify sendkit is installed and working
- User asks about or wants to use the `sendkit` or `telekit` toolset
- User wants to choose between MCP and CLI workflows

## MCP Tool (preferred)

The sendkit MCP server registers a single tool called **`telegram`**. If the `sendkit` MCP server is
configured and enabled, use this tool directly.

### Tool parameters

| Parameter | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| `chatId`  | string | yes      | Telegram chat ID to send to  |
| `message` | string | yes      | Message text to send         |

### Tool output

Returns `{ ok: true, messageId: number, chatId: string }` on success.

### Example

```
sendkit_telegram(chatId: "123456789", message: "Hello from sendkit")
```

## CLI Fallback (`telekit`)

If the MCP server is not available, fall back to the CLI.

### Setup

```bash
telekit init --telegram-bot-token "<BOT_TOKEN>"
```

This saves the token to `~/.config/sendkit/config.json` (mode `0600`).

### Send a message

```bash
telekit telegram <chatId> "<message>"
```

Outputs a JSON result to stdout.

### Example

```bash
telekit telegram 123456789 "Hello from sendkit"
```

## Choosing between MCP and CLI

| Criterion               | MCP tool                | CLI (`telekit`)          |
|-------------------------|-------------------------|--------------------------|
| Agent-initiated messages | Preferred — single tool call | Requires bash invocation |
| Manual / ad-hoc use     | Not suitable            | Ideal                    |
| Token management        | Via env var (`TELEGRAM_BOT_TOKEN`) | Via `telekit init`     |
| Error handling          | Structured JSON error   | Exits non-zero on error  |

**Default rule:** Prefer the MCP tool. Use the CLI only when the MCP server is not configured or
when the user explicitly asks for a manual / command-line workflow.

## Verifying sendkit

To verify sendkit is working:

1. **Check MCP availability** — Attempt to call the `sendkit_telegram` tool. If it resolves, the
   MCP server is running and configured.
2. **Check CLI availability** — Run `telekit --help`. If the command exists and prints usage, the
   CLI is installed.
3. **Send a test message** — Use either interface to send a short message to a known chat ID.
   Confirm the returned `messageId` is a number and `ok` is `true`.

## Environment requirements

- `TELEGRAM_BOT_TOKEN` — Required for the MCP server (passed as an environment variable).
  Obtained from [BotFather](https://t.me/BotFather).
- The CLI reads the token from `~/.config/sendkit/config.json` after `telekit init`.
