const express = require("express");
const { listModels } = require("../controllers/benchmarkController");

const router = express.Router();

// GET /api/benchmark/models — returns normalized AI model data
router.get("/models", listModels);

module.exports = router;
