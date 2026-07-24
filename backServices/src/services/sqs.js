const {
    SQSClient,
    SendMessageCommand
} = require("@aws-sdk/client-sqs");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.queueUrl || body.messageBody === undefined) {
        return res.status(400).json({
            success: false,
            error: "Faltan queueUrl o messageBody"
        });
    }

    const client = new SQSClient(createClientConfig(body));

    const response = await client.send(
        new SendMessageCommand({
            QueueUrl: body.queueUrl,
            MessageBody:
                typeof body.messageBody === "string"
                    ? body.messageBody
                    : JSON.stringify(body.messageBody),
            DelaySeconds: body.delaySeconds || 0
        })
    );

    return res.json({
        success: true,
        messageId: response.MessageId,
        md5OfMessageBody: response.MD5OfMessageBody
    });
};
