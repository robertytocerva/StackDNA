const { AppConfigClient, ListApplicationsCommand } = require("@aws-sdk/client-appconfig");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new AppConfigClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListApplicationsCommand({}));
    return { applications: response.Items || [] };
};
