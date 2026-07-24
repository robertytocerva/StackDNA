const {
    CognitoIdentityProviderClient,
    ListUserPoolsCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const { createAwsReadConfig } = require("./awsReadConfig");

module.exports = async ({ credentials, region }) => {
    const client = new CognitoIdentityProviderClient(createAwsReadConfig({ ...credentials, region }));
    const response = await client.send(new ListUserPoolsCommand({ MaxResults: 10 }));
    return { userPools: response.UserPools || [] };
};
