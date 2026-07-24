const { SSMClient, DescribeParametersCommand } = require("@aws-sdk/client-ssm");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new SSMClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new DescribeParametersCommand({}));
    return { parameters: response.Parameters || [] };
};
