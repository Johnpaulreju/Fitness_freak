const express = require("express");
const router = express.Router();
const FitnessController = require("../controllers/fitnessController");

// Route to save user fitness details
router.post("/saveFitnessData", FitnessController.saveFitnessData);
router.get("/getFitnessData/:userId", FitnessController.getUserDetails);

module.exports = router;
