import { inspect } from "util";
import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const inputs = {
      token: core.getInput("token"),
      /*repository: core.getInput("repository"),
      issueNumber: core.getInput("issue-number"),
      commentAuthor: core.getInput("comment-author"),
      bodyIncludes: core.getInput("body-includes"),*/
    };
    core.debug(`Inputs: ${inspect(inputs)}`);

    const repository: string = process.env.GITHUB_REPOSITORY as string;
    const [owner, repo] = repository.split("/");
    core.debug(`repository: ${repository}`);

    const octokit = github.getOctokit(inputs.token);
    core.info(JSON.stringify(github.context));

    const { data: comments } = await octokit.issues.listComments({
      owner: owner,
      repo: repo,
      issue_number: 2,
    });
    core.info(JSON.stringify(comments));

    /*const comment = comments.find((comment) => {
      return (
        (inputs.commentAuthor
          ? comment.user.login === inputs.commentAuthor
          : true) &&
        (inputs.bodyIncludes
          ? comment.body.includes(inputs.bodyIncludes)
          : true)
      );
    });

    if (comment) {
      core.setOutput("comment-id", comment.id.toString());
    } else {
      core.setOutput("comment-id", "");
    }*/
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

run();
