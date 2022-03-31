const { composeCreatePullRequest } = require("octokit-plugin-create-pull-request");
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

async function openPullRequest(context) {
  const prInfo = {
    owner: "AllInOpenSource",
    repo: "All-In-for-Students-Graduation-2022",
    title: "Yearbook Quote Submission",
    body: `@${context.payload.sender.login}  is requesting to add their yearbook quote. Please ensure your pull request meets the requirements:
   
- [ ] Must include your full name
- [ ] Must include your yearbook quote
- [ ] Must include your Institution
- [ ] Must include your GitHub handle`,
    base: "main" /* optional: defaults to default branch */,
    // need to create a way to make each branch unique
    head: `new-year-book-submission-${Date.now()}`,
    forceFork: false,
    changes: [
      {
        files: {
          "yearbook-quotes.md": ({ exists, encoding, content }) => {
            // do not create the file if it does not exist
            if (!exists) return null;
            const prContents = `---\n${context.payload.issue.body}\n----`;
            let prContentsString = Buffer.from(prContents, "utf8").toString('base64');
            return Buffer.from(prContentsString, encoding)
              .toString("utf-8")
          },
        },
        commit:
          `adding @${context.payload.sender.login} to yearbook 2022`,
      },
    ],
  }
  await composeCreatePullRequest(context.octokit, prInfo).catch(async (err) => {
    if (err) {
      console.log(err.status, err);
    }
  });
}

module.exports = (app) => {
  app.on("issues.opened", async (context) => {
    await openPullRequest(context);
  });
};
