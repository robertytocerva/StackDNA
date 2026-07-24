const {
    SFNClient,
    StartExecutionCommand
} = require("@aws-sdk/client-sfn");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.stateMachineArn) {
        return res.status(400).json({
            success: false,
            error: "Falta stateMachineArn"
        });
    }

    const client = new SFNClient(createClientConfig(body));

    const response = await client.send(
        new StartExecutionCommand({
            stateMachineArn: body.stateMachineArn,
            name: body.executionName || undefined,
            input: JSON.stringify(body.input ?? {})
        })
    );

    return res.json({
        success: true,
        executionArn: response.executionArn,
        startDate: response.startDate
    });
};
