const { XRayClient, GetGroupsCommand } = require("@aws-sdk/client-xray");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new XRayClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new GetGroupsCommand({}));
    return { groups: response.Groups || [] };
};
