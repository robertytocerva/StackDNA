const { getModels } = require("../services/benchmarkService");

async function listModels(req, res) {
  try {
    const { models, fromCache } = await getModels();
    return res.json({
      success: true,
      count: models.length,
      cached: fromCache,
      timestamp: new Date().toISOString(),
      data: models,
    });
  } catch (error) {
    console.error("[Benchmark] Error fetching models:", error.message);
    return res.status(502).json({
      success: false,
      error: "No se pudieron obtener los datos de Artificial Analysis",
      detail: error.message,
    });
  }
}

module.exports = { listModels };
