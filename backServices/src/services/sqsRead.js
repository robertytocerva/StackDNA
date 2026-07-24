const { SQSClient, ListQueuesCommand } = require("@aws-sdk/client-sqs");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new SQSClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListQueuesCommand({}));
    return { queues: response.QueueUrls || [] };
};
