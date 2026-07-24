const express = require("express");
const { callService } = require("../controllers/awsController");
const { validateCredentials } = require("../middleware/validate");
const { awsLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/call", awsLimiter, validateCredentials, callService);

module.exports = router;
