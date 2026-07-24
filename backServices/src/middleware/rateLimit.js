const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Demasiadas peticiones. Intenta en 15 minutos." }
});

const awsLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Límite de llamadas AWS alcanzado. Espera 1 minuto." }
});

module.exports = { globalLimiter, awsLimiter };
