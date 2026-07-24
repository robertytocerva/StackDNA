const {
    CognitoIdentityProviderClient,
    ListUsersCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.userPoolId) {
        return res.status(400).json({
            success: false,
            error: "Falta userPoolId"
        });
    }

    const client = new CognitoIdentityProviderClient(
        createClientConfig(body)
    );

    const response = await client.send(
        new ListUsersCommand({
            UserPoolId: body.userPoolId,
            Limit: body.limit || 25,
            Filter: body.filter || undefined
        })
    );

    return res.json({
        success: true,
        users: response.Users || [],
        paginationToken: response.PaginationToken
    });
};
