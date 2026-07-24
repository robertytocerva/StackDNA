const { z } = require("zod");
const {
    ACCESS_KEY_REGEX,
    SECRET_KEY_REGEX,
    VALID_REGIONS,
    VALID_SERVICES
} = require("./security");

const credentialsSchema = z.object({
    service: z.enum(VALID_SERVICES),
    accessKeyId: z.string().regex(ACCESS_KEY_REGEX),
    secretAccessKey: z.string().regex(SECRET_KEY_REGEX),
    region: z.enum(VALID_REGIONS),
    sessionToken: z.string().min(1).optional(),
    action: z.string().max(100).optional()
});

function validateCredentials(req, res, next) {
    if (!req.headers["content-type"]?.includes("application/json")) {
        return res.status(415).json({ error: "Solo se acepta application/json" });
    }

    const result = credentialsSchema.safeParse(req.body);
    if (!result.success) {
        const requiredFields = ["accessKeyId", "secretAccessKey", "region", "service"];
        const hasMissingFields = requiredFields.some((field) => {
            const value = req.body?.[field];
            return value === undefined || value === null || value === "";
        });

        if (hasMissingFields) {
            return res.status(400).json({
                error: "Faltan campos requeridos: accessKeyId, secretAccessKey, region, service"
            });
        }

        const invalidField = result.error.issues[0]?.path.join(".");
        const messages = {
            accessKeyId: "Formato de Access Key inválido",
            secretAccessKey: "Formato de Secret Key inválido",
            region: "Región AWS no válida",
            service: "Servicio no soportado"
        };

        return res.status(400).json({
            error: messages[invalidField] || "Payload inválido"
        });
    }

    req.awsPayload = result.data;
    return next();
}

module.exports = { validateCredentials };
