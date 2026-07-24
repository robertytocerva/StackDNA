const { EventBridgeClient, ListEventBusesCommand } = require("@aws-sdk/client-eventbridge");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new EventBridgeClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListEventBusesCommand({}));
    return { eventBuses: response.EventBuses || [] };
};
