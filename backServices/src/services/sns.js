const {
    SNSClient,
    PublishCommand
} = require("@aws-sdk/client-sns");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.topicArn || body.message === undefined) {
        return res.status(400).json({
            success: false,
            error: "Faltan topicArn o message"
        });
    }

    const client = new SNSClient(createClientConfig(body));

    const response = await client.send(
        new PublishCommand({
            TopicArn: body.topicArn,
            Subject: body.subject || undefined,
            Message:
                typeof body.message === "string"
                    ? body.message
                    : JSON.stringify(body.message)
        })
    );

    return res.json({
        success: true,
        messageId: response.MessageId,
        sequenceNumber: response.SequenceNumber
    });
};
