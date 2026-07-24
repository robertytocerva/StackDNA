const {
    SecretsManagerClient,
    GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const { createClientConfig } = require("./awsConfig");

module.exports = async (req, res) => {
    const body = req.body;

    if (!body.secretId) {
        return res.status(400).json({
            success: false,
            error: "Falta secretId"
        });
    }

    const client = new SecretsManagerClient(
        createClientConfig(body)
    );

    const response = await client.send(
        new GetSecretValueCommand({
            SecretId: body.secretId,
            VersionStage: body.versionStage || undefined
        })
    );

    return res.json({
        success: true,
        name: response.Name,
        arn: response.ARN,
        versionId: response.VersionId,
        versionStages: response.VersionStages,
        secretString: response.SecretString,
        secretBinary: response.SecretBinary
            ? Buffer.from(response.SecretBinary).toString("base64")
            : undefined
    });
};
