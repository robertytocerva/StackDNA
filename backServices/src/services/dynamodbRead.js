const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new DynamoDBClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListTablesCommand({}));
    return { tables: response.TableNames || [] };
};
