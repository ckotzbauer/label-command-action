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
            process.env.GITHUB_WORKSPACE as string,
            ".github",
            inputs.configFile || "label-commands.json"
        );

        let config = JSON.parse(readFileSync(configUrl).toString());
        core.info(`Config: ${JSON.stringify(config)}`);

        const eventName = process.env.GITHUB_EVENT_NAME;
        let body: string;
        let objectNumber: number;
        core.info(`Processing payload for event [${eventName}]: ${JSON.stringify(github.context.payload)}`);

        if (eventName === "issue_comment") {
            body = github.context.payload.comment?.body as string;
            objectNumber = github.context.payload.issue?.number as number;
        } else if (eventName === "pull_request") {
            body = github.context.payload.pull_request?.body as string;
            objectNumber = github.context.payload.pull_request?.number as number;
        } else if (eventName === "issues") {
            body = github.context.payload.issue?.body as string;
            objectNumber = github.context.payload.issue?.number as number;
        } else {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const commands = extractCommands(body, config.commands) as Command[];
        core.info(`Extracted ${commands.length} commands.`);

        const allowedUsers = config.allowedUsers as string[] || [];
        const octokit = github.getOctokit(inputs.token);
        const repository: string = process.env.GITHUB_REPOSITORY as string;
        const [owner, repo] = repository.split("/");

        if (commands.length > 0 && !allowedUsers.includes(github.context.actor)) {
            if (github.context.actor.includes("[bot]")) {
                return;
            }

            core.warning(`${github.context.actor} is not allowed to post a command.`);
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: github.context.payload.issue?.number as number,
                body: `@${github.context.actor} You are not allowed to post a command.`
            });

            return;
        }

        commands.forEach(async (c) => {
            core.info(`Process command: ${JSON.stringify(c)}`);

            if (c.command === "add-label") {
                await octokit.rest.issues.addLabels({
                    owner,
                    repo,
                    issue_number: objectNumber,
                    labels: [c.arg]
                });
            } else if (c.command === "remove-label") {
                await octokit.rest.issues.removeLabel({
                    owner,
                    repo,
                    issue_number: objectNumber,
                    name: c.arg
                });
            } else {
                core.setFailed(`Invalid action: ${c.command}`);
                return;
            }

            if (c.dispatch) {
                const re = await octokit.rest.repos.createDispatchEvent({
                    repo,
                    owner,
                    event_type: c.dispatch
                });
                core.info(`Dispatch response: ${JSON.stringify(re)}`);
            }
        });
    } catch (error) {
        core.info(inspect(error));
        core.setFailed(error.message);
    }
}

run();
