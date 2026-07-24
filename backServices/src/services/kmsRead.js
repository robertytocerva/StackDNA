const { KMSClient, ListKeysCommand } = require("@aws-sdk/client-kms");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new KMSClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListKeysCommand({}));
    return { keys: response.Keys || [] };
};
