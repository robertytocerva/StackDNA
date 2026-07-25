const axios = require("axios");

const WANDBOX_API = "https://wandbox.org/api/compile.json";
const JAVA_COMPILER = "openjdk-jdk-21+35";

async function executeCode(code, stdin = "") {

  console.log("=================================");
  console.log("Entró a executeCode()");
  console.log("Compilador:", JAVA_COMPILER);

  const sanitizedCode = code.replace(
    /public\s+class\s+Main/g,
    "class Main"
  );

  console.log("Código enviado:");
  console.log(sanitizedCode);

  try {

    console.log(">>> Enviando petición a Wandbox...");

    const response = await axios.post(
      WANDBOX_API,
      {
        code: sanitizedCode,
        compiler: JAVA_COMPILER,
        stdin: stdin,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(">>> Respuesta recibida");
    console.log(response.data);

    const {
      program_output,
      program_error,
      compiler_error,
      status,
    } = response.data;

    return {
      stdout: program_output || null,
      stderr: program_error || null,
      compile: compiler_error || null,
      status: status || null,
    };

  } catch (err) {

    console.log("========== ERROR AXIOS ==========");
    console.log("message:", err.message);
    console.log("status:", err.response?.status);
    console.log("headers:", err.response?.headers);
    console.log("data:", err.response?.data);

    throw err;
  }
}

module.exports = { executeCode };