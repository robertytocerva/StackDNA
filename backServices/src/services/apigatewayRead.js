const { APIGatewayClient, GetRestApisCommand } = require("@aws-sdk/client-api-gateway");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new APIGatewayClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new GetRestApisCommand({}));
    return { apis: response.items || [] };
};
