const { SNSClient, ListTopicsCommand } = require("@aws-sdk/client-sns");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new SNSClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListTopicsCommand({}));
    return { topics: response.Topics || [] };
};
