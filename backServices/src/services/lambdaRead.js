const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new LambdaClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListFunctionsCommand({}));
    return { functions: response.Functions || [] };
};
