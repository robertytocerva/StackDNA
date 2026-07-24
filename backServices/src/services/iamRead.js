const { IAMClient, ListUsersCommand } = require("@aws-sdk/client-iam");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new IAMClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListUsersCommand({}));
    return { users: response.Users || [] };
};
