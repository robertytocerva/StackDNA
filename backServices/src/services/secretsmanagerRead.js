const { SecretsManagerClient, ListSecretsCommand } = require("@aws-sdk/client-secrets-manager");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new SecretsManagerClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListSecretsCommand({}));
    return { secrets: response.SecretList || [] };
};
