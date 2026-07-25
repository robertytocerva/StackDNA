const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const executeRoute = require("./routes/execute");
const codeRoute = require("./routes/code");
const awsRoute = require("./routes/aws");
const { globalLimiter } = require("./middleware/rateLimit");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4321";

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10kb" }));
app.use(globalLimiter);

// Ruta heredada: se conserva para los consumidores anteriores del backend.
app.use("/execute", executeRoute);
// Ejecución de código (Python, Java) vía Wandbox.
app.use("/code", codeRoute);
// Nuevo contrato del API Tester: POST /api/aws/call.
app.use("/api/aws", awsRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.json({ message: "Backend funcionando" }));

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ error: "JSON inválido" });
    }
    return next(error);
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});