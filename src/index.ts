import { join } from "path";
import { readFileSync } from "fs";
import { inspect } from "util";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { extractCommands } from "./extract-commands";
import { Command } from "./types";

async function run() {
    try {
        const inputs = {
            token: core.getInput("token"),
            configFile: core.getInput("config-file"),
        };

        const configUrl = join(
            process.env["GITHUB_WORKSPACE"] as string,
            ".github",
            inputs.configFile || "label-commands.json"
        );

        core.info(`Config-URL: ${configUrl}`);
        let config = JSON.parse(readFileSync(configUrl).toString());

        const repository: string = process.env.GITHUB_REPOSITORY as string;
        const [owner, repo] = repository.split("/");

        const body = github.context.payload.comment?.body as string;
        const commands = extractCommands(body, config) as Command[];        
        const octokit = github.getOctokit(inputs.token);

        commands.forEach(async (c) => {
            if (c.command === "add-label") {
                await octokit.issues.addLabels({
                    owner,
                    repo,
                    issue_number: github.context.payload.issue?.number as number,
                    labels: [c.arg]
                });
            } else if (c.command === "remove-label") {
                await octokit.issues.removeLabel({
                    owner,
                    repo,
                    issue_number: github.context.payload.issue?.number as number,
                    name: c.arg
                });
            } else {
                core.setFailed(`Invalid action: ${c.command}`);
            }
        });
    } catch (error) {
        core.debug(inspect(error));
        core.setFailed(error.message);
    }
}

run();
