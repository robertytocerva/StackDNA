const axios = require("axios");

const WANDBOX_API = "https://wandbox.org/api/compile.json";

const PYTHON_COMPILER = "cpython-3.12.7";

async function executePython(code, stdin = "") {
  const response = await axios.post(
    WANDBOX_API,
    {
      code,
      compiler: PYTHON_COMPILER,
      stdin,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const {
    program_output,
    program_error,
    compiler_error,
    status,
  } = response.data;

  return {
    stdout: program_output || "",
    stderr: program_error || "",
    compile: compiler_error || "",
    status,
    raw: response.data,
  };
}

module.exports = { executePython };