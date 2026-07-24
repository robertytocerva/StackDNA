const { SFNClient, ListStateMachinesCommand } = require("@aws-sdk/client-sfn");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new SFNClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListStateMachinesCommand({}));
    return { stateMachines: response.stateMachines || [] };
};
