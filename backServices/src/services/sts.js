const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new STSClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new GetCallerIdentityCommand({}));
    return { userId: response.UserId, account: response.Account, arn: response.Arn };
};
