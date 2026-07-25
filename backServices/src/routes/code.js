const express = require("express");
const { executeCode } = require("../services/judge0");
const { executePython } = require("../services/python");

const router = express.Router();

router.post("/execute", async (req, res) => {
  console.log("=================================");
  console.log("Entró a POST /code/execute");
  console.log("Body:", req.body);

  const { code, stdin, language } = req.body;

  if (!code) {
    return res.status(400).json({
      error: "El campo code es requerido",
    });
  }

  try {
    let result;

    console.log("Language recibido:", language);

    switch (language) {

      case "python":
        console.log(">>> Ejecutando Python");
        result = await executePython(code, stdin || "");
        break;

      case "java":
        console.log(">>> Ejecutando Java");
        result = await executeCode(code, stdin || "");
        break;

      default:
        console.log(">>> Lenguaje no reconocido");
        return res.status(400).json({
          error: "Lenguaje no soportado"
        });
    }

    console.log("Resultado:", result);

    res.json(result);

  } catch (error) {

    console.log("========== ERROR ==========");
    console.log("message:", error.message);
    console.log("status:", error.response?.status);
    console.log("data:", error.response?.data);
    console.log("stack:", error.stack);

    res.status(500).json({
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
});

module.exports = router;