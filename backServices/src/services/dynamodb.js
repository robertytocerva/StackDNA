const {
    DynamoDBClient,
    ScanCommand
} = require("@aws-sdk/client-dynamodb");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.tableName) {
        return res.status(400).json({
            success: false,
            error: "Falta tableName"
        });
    }

    const client = new DynamoDBClient(createClientConfig(body));

    const response = await client.send(
        new ScanCommand({
            TableName: body.tableName,
            Limit: body.limit || 25
        })
    );

    return res.json({
        success: true,
        count: response.Count,
        scannedCount: response.ScannedCount,
        items: response.Items || []
    });
};
