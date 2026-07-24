const {
    EventBridgeClient,
    PutEventsCommand
} = require("@aws-sdk/client-eventbridge");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    const entries = body.entries || [
        {
            Source: body.source,
            DetailType: body.detailType,
            Detail:
                typeof body.detail === "string"
                    ? body.detail
                    : JSON.stringify(body.detail ?? {}),
            EventBusName: body.eventBusName || "default"
        }
    ];

    if (!entries[0].Source || !entries[0].DetailType) {
        return res.status(400).json({
            success: false,
            error: "Faltan source o detailType"
        });
    }

    const client = new EventBridgeClient(createClientConfig(body));
    const response = await client.send(
        new PutEventsCommand({ Entries: entries })
    );

    return res.json({
        success: response.FailedEntryCount === 0,
        failedEntryCount: response.FailedEntryCount,
        entries: response.Entries || []
    });
};
