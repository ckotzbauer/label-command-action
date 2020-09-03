import { CommandConfig, Command } from "./types";

export const extractCommands = (body: string, config: CommandConfig[]): (Command | null)[] => {
    const exp = /^\/(?<command>[A-Za-z-]+) ?(?<arg>[A-Za-z-]*)$/;
    const commandWords = config.map((c) => c.command);

    return body.split("\r\n")
        .map((line) => {
            const match = line.match(exp);

            if (!match) {
                return null;
            }

            const command = match.groups?.command as string;
            const arg = match.groups?.arg as string;
            const matchedCommand = config
                .find((c) => c.command === command && (c.arg === arg || new RegExp(c.arg).test(arg)));

            if (!matchedCommand) {
                return null;
            }

            return { command: matchedCommand.action, arg: matchedCommand.label };
        })
        .filter((c) => c);
}
