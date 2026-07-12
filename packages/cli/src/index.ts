#!/usr/bin/env node
import { Command } from "commander";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sendTelegramMessage } from "@sr_telekit/sendkit-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

const program = new Command();
const configPath = join(homedir(), ".config", "sendkit", "config.json");

const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, {
    mode: 0o600,
  });
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required, Run `telekit init`");
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  const token = config.telegramBotToken;

  if (!token) {
    throw new Error("Telegram bot token is required, Run `telekit init`");
  }

  return token;
}

program.name("telekit").description("telekit CLI backed by sendkit-core");

program
  .command("init")
  .description("configure Telekit CLI local settings")
  .requiredOption("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`saved telekit CLI config to ${configPath}`);
  });

program
  .command("telegram")
  .description("Send a telegram message")
  .argument("<chatId>", "Telegram chat ID")
  .argument("<message>", "Message text to send")
  .action(async (chatId: string, message: string) => {
    const result = await sendTelegramMessage({
      botToken: getTelegramBotToken(),
      chatId,
      message,
    });

    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
