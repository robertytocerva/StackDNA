const {
    APIGatewayClient,
    GetRestApisCommand
} = require("@aws-sdk/client-api-gateway");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;
    const client = new APIGatewayClient(createClientConfig(body));

    const response = await client.send(
        new GetRestApisCommand({
            limit: body.limit || 25
        })
    );

    return res.json({
        success: true,
        apis: response.items || [],
        position: response.position
    });
};
