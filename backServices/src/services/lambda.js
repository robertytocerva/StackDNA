const {
    LambdaClient,
    InvokeCommand
} = require("@aws-sdk/client-lambda");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.functionName) {
        return res.status(400).json({
            success: false,
            error: "Falta functionName"
        });
    }

    const client = new LambdaClient(createClientConfig(body));

    const response = await client.send(
        new InvokeCommand({
            FunctionName: body.functionName,
            InvocationType: body.invocationType || "RequestResponse",
            Payload: Buffer.from(
                JSON.stringify(body.payload ?? {})
            )
        })
    );

    let payload = null;

    if (response.Payload) {
        const text = Buffer.from(response.Payload).toString("utf8");

        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    return res.json({
        success: true,
        statusCode: response.StatusCode,
        functionError: response.FunctionError,
        executedVersion: response.ExecutedVersion,
        payload
    });
};
