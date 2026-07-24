const express = require("express");

const router = express.Router();

const services = {
    s3: require("../services/s3"),
    lambda: require("../services/lambda"),
    dynamodb: require("../services/dynamodb"),
    sqs: require("../services/sqs"),
    sns: require("../services/sns"),
    cognito: require("../services/cognito"),
    apigateway: require("../services/apigateway"),
    "api-gateway": require("../services/apigateway"),
    eventbridge: require("../services/eventbridge"),
    stepfunctions: require("../services/stepfunctions"),
    sfn: require("../services/stepfunctions"),
    secretsmanager: require("../services/secretsmanager"),
    "secrets-manager": require("../services/secretsmanager")
};

router.post("/", async (req, res) => {
    try {
        const service = String(req.body.service || "")
            .trim()
            .toLowerCase();

        const executeService = services[service];

        if (!executeService) {
            return res.status(400).json({
                success: false,
                error: `Servicio no soportado: ${service || "(vacío)"}`,
                supportedServices: [
                    "s3",
                    "lambda",
                    "dynamodb",
                    "sqs",
                    "sns",
                    "cognito",
                    "apigateway",
                    "eventbridge",
                    "stepfunctions",
                    "secretsmanager"
                ]
            });
        }

        return await executeService(req, res);
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
            name: error.name,
            metadata: error.$metadata || undefined
        });
    }
});

module.exports = router;
