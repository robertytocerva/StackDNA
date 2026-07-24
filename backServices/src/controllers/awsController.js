const { sanitizeLog } = require("../middleware/security");
const callSTS = require("../services/sts");
const callEventBridge = require("../services/eventbridgeRead");
const callCloudFormation = require("../services/cloudformationRead");
const callSSM = require("../services/ssmRead");
const callKMS = require("../services/kmsRead");
const callStepFunctions = require("../services/stepfunctionsRead");
const callECR = require("../services/ecrRead");
const callAppConfig = require("../services/appconfigRead");
const callXRay = require("../services/xrayRead");
const callCognito = require("../services/cognitoPools");

const SERVICE_MAP = {
    sts: callSTS,
    eventbridge: callEventBridge,
    cloudformation: callCloudFormation,
    ssm: callSSM,
    kms: callKMS,
    stepfunctions: callStepFunctions,
    ecr: callECR,
    appconfig: callAppConfig,
    xray: callXRay,
    cognito: callCognito
};

function redact(value) {
    return String(value || "")
        .replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_ACCESS_KEY]")
        .replace(/[A-Za-z0-9/+=]{40}/g, "[REDACTED_SECRET_KEY]");
}

async function callService(req, res) {
    const { service, accessKeyId, secretAccessKey, sessionToken, region } = req.awsPayload;
    console.log("Petición AWS recibida:", sanitizeLog(req.awsPayload));

    try {
        const data = await SERVICE_MAP[service]({
            credentials: { accessKeyId, secretAccessKey, ...(sessionToken ? { sessionToken } : {}) },
            region
        });

        return res.json({ status: 200, message: "Conexión exitosa", service, region, data });
    } catch (error) {
        const statusCode = error.$metadata?.httpStatusCode || 502;
        return res.status(statusCode).json({
            status: statusCode,
            service,
            error: error.name || "Error desconocido",
            message: redact(error.message || "Error al conectar con AWS")
        });
    }
}

module.exports = { callService };
