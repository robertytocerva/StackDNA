const { CloudFormationClient, ListStacksCommand } = require("@aws-sdk/client-cloudformation");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new CloudFormationClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListStacksCommand({}));
    return { stacks: response.StackSummaries || [] };
};
